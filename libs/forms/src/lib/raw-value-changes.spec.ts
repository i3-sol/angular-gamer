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

  it('should emit on setValue', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;

      const control = new FormControl<string>('x', { nonNullable: true });
      cold('-a-b|').subscribe({
        next: (v) => control.setValue(v),
      });
      const expected = '-a-b';

      const sut$ = rawValueChanges(control, { replayCurrentValue: false });

      expectObservable(sut$).toBe(expected);
    });
  });

  it('should emit on subscription and on setValue', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;

      const control = new FormControl<string>('x', { nonNullable: true });
      cold('-a-b|').subscribe({
        next: (v) => control.setValue(v),
      });
      const expected = 'xa-b';

      const sut$ = rawValueChanges(control, { replayCurrentValue: true });

      expectObservable(sut$).toBe(expected);
    });
  });

  it('should emit current value at time of subscription', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;

      const control = new FormControl<string>('x', { nonNullable: true });
      cold('|').subscribe({
        next: (v) => control.setValue(v),
      });
      const expected = 'z';

      const sut$ = rawValueChanges(control, { replayCurrentValue: true });
      control.setValue('y');
      control.setValue('z');

      expectObservable(sut$).toBe(expected);
    });
  });
});
