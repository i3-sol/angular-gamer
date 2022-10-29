import { FormControl, FormGroup } from '@angular/forms';
import { zip } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { rawValueChanges } from './raw-value-changes';

describe('rawValueChanges', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should emit raw value', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;

      const form = new FormGroup({
        enabled: new FormControl<string>('', { nonNullable: true }),
        disabled: new FormControl<string>('', { nonNullable: true }),
      });

      const aRawFormValue = { enabled: 'a enabled', disabled: 'a disabled' };
      const bRawFormValue = { enabled: 'a enabled', disabled: 'a disabled' };
      const cRawFormValue = { enabled: 'c enabled', disabled: 'c disabled' };
      const aFormValue = { enabled: 'a enabled', disabled: 'a disabled' };
      const bFormValue = { enabled: 'a enabled' };
      const cFormValue = { enabled: 'c enabled' };
      const marbles = ' -a----c|';
      const expected = '-(ab)-c';

      cold(marbles, {
        a: aRawFormValue,
        c: cRawFormValue,
      }).subscribe({
        next: (v) => {
          form.setValue(v);
          if (form.controls.disabled.enabled) {
            form.controls.disabled.disable();
          }
        },
      });

      const sut$ = zip([
        rawValueChanges(form, { replayCurrentValue: false }),
        form.valueChanges,
      ]);

      expectObservable(sut$).toBe(expected, {
        a: [aRawFormValue, aFormValue],
        b: [bRawFormValue, bFormValue],
        c: [cRawFormValue, cFormValue],
      });
    });
  });

  it('should emit on setValue', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;

      const control = new FormControl<string>('x', { nonNullable: true });
      const marbles = ' -a-b|';
      const expected = '-a-b';

      cold(marbles).subscribe({
        next: (v) => control.setValue(v),
      });

      const sut$ = rawValueChanges(control, { replayCurrentValue: false });

      expectObservable(sut$).toBe(expected);
    });
  });

  it('should emit on subscription and on setValue', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;

      const control = new FormControl<string>('x', { nonNullable: true });
      const marbles = ' -a-b|';
      const expected = 'xa-b';

      cold(marbles).subscribe({
        next: (v) => control.setValue(v),
      });

      const sut$ = rawValueChanges(control, { replayCurrentValue: true });

      expectObservable(sut$).toBe(expected);
    });
  });

  it('should emit current value at time of subscription', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;

      const control = new FormControl<string>('x', { nonNullable: true });
      const marbles = ' |';
      const expected = 'z';

      cold(marbles).subscribe({
        next: (v) => control.setValue(v),
      });

      const sut$ = rawValueChanges(control, { replayCurrentValue: true });
      control.setValue('y');
      control.setValue('z');

      expectObservable(sut$).toBe(expected);
    });
  });
});
