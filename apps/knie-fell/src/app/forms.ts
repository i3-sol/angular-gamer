import { AbstractControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';

export const rawValueChanges = <TControl, TRawValue extends TControl>(
  form: AbstractControl<TControl, TRawValue>
): Observable<TRawValue> => {
  return form.valueChanges.pipe(
    startWith(form.value),
    map(() => form.getRawValue())
  );
};
