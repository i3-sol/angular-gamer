import { AbstractControl } from '@angular/forms';
import { concat, EMPTY, map, Observable, of } from 'rxjs';

export type RawValueChangesOptions = {
  replayCurrentValue?: boolean;
};

export const RAW_VALUE_CHANGES_OPTIONS_DEFAULTS: RawValueChangesOptions = {
  replayCurrentValue: false,
};

export const rawValueChanges = <TControl, TRawValue extends TControl>(
  form: AbstractControl<TControl, TRawValue>,
  options?: RawValueChangesOptions
): Observable<TRawValue> => {
  const actualOptions = { ...RAW_VALUE_CHANGES_OPTIONS_DEFAULTS, ...options };

  const initialTrigger$ = actualOptions.replayCurrentValue ? of(null) : EMPTY;
  const changeTrigger$ = form.valueChanges;

  return concat(initialTrigger$, changeTrigger$).pipe(
    map(() => form.getRawValue())
  );
};
