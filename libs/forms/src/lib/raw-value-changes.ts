import { AbstractControl } from '@angular/forms';
import { concat, EMPTY, map, Observable, of } from 'rxjs';

export type RawValueChangesOptions = {
  replayCurrentValue?: boolean;
};

export const RAW_VALUE_CHANGES_OPTIONS_DEFAULTS: RawValueChangesOptions = {
  replayCurrentValue: false,
};

/**
 * Creates an observable that emits the raw values,
 * whenever the valueChanges emits a value.
 * It can optionally replay the current value
 * when the observable is subscribed to.
 */
export const rawValueChanges = <TControl, TRawValue extends TControl>(
  control: AbstractControl<TControl, TRawValue>,
  options?: Partial<RawValueChangesOptions>
): Observable<TRawValue> => {
  const actualOptions = { ...RAW_VALUE_CHANGES_OPTIONS_DEFAULTS, ...options };

  const initialTrigger$ = actualOptions.replayCurrentValue ? of(null) : EMPTY;
  const changeTrigger$ = control.valueChanges;

  return concat(initialTrigger$, changeTrigger$).pipe(
    map(() => control.getRawValue())
  );
};
