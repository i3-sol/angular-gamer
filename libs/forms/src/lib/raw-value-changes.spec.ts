import { FormControl } from '@angular/forms';
import { TestScheduler } from 'rxjs/testing';

import { rawValueChanges } from './raw-value-changes';

describe('rawValueChanges', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should emit raw value on setValue', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;

      const control = new FormControl<string>('x', { nonNullable: true });
      cold('-a-b').subscribe({
        next: (v) => control.setValue(v),
      });
      const expected = '-a-b';

      const sut$ = rawValueChanges(control, { emitInitialValue: false });

      expectObservable(sut$).toBe(expected);
    });
  });

  it('should emit initial value and raw value on setValue', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;

      const control = new FormControl<string>('x', { nonNullable: true });
      cold('-a-b').subscribe({
        next: (v) => control.setValue(v),
      });
      const expected = 'xa-b';

      const sut$ = rawValueChanges(control, { emitInitialValue: true });

      expectObservable(sut$).toBe(expected);
    });
  });

  it('should emit initial value at time of subscription and raw value on setValue', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;

      const control = new FormControl<string>('x', { nonNullable: true });
      cold('-a-b').subscribe({
        next: (v) => control.setValue(v),
      });
      const expected = 'ya-b';

      const sut$ = rawValueChanges(control, { emitInitialValue: true });
      control.setValue('y');

      expectObservable(sut$).toBe(expected);
    });
  });
});
