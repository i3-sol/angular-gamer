import { AbstractControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';

export const rawValueChanges = <TControl, TRawValue extends TControl>(
  form: AbstractControl<TControl, TRawValue>,
  options?: { emitInitialValue: boolean }
): Observable<TRawValue> => {
  const formValueChanges = options?.emitInitialValue
    ? form.valueChanges.pipe(startWith(form.value))
    : form.valueChanges;

  return formValueChanges.pipe(map(() => form.getRawValue()));
};
