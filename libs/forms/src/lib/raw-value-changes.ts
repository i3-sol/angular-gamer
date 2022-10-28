import { AbstractControl } from '@angular/forms';
import { concat, defer, map, Observable, of } from 'rxjs';

export type RawValueChangesOptions = {
  emitInitialValue?: boolean;
};

export const RAW_VALUE_CHANGES_OPTIONS_DEFAULTS: RawValueChangesOptions = {
  emitInitialValue: false,
};

export const rawValueChanges = <TControl, TRawValue extends TControl>(
  form: AbstractControl<TControl, TRawValue>,
  options?: RawValueChangesOptions
): Observable<TRawValue> => {
  const actualOptions = { ...RAW_VALUE_CHANGES_OPTIONS_DEFAULTS, ...options };
  const formValueChanges = actualOptions.emitInitialValue
    ? concat(
        defer(() => of(form.value)),
        form.valueChanges
      )
    : form.valueChanges;

  return formValueChanges.pipe(map(() => form.getRawValue()));
};
