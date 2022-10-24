import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { rawValueChanges } from '@flensrocker/forms';
import { combineLatest, map, Observable } from 'rxjs';

import {
  createObererBlockForm,
  initialObererBlockValue,
  ObererBlockForm,
  ObererBlockState,
  ObererBlockValue,
  mapObererBlockFormToState,
} from './oberer-block';

export type SpielValue = {
  readonly nummer: number;
  readonly obererBlock: ObererBlockValue;
};

export const initialSpielValue = (nummer: number): SpielValue => ({
  nummer,
  obererBlock: initialObererBlockValue,
});

export type SpielForm = {
  nummer: FormControl<number>;
  obererBlock: FormGroup<ObererBlockForm>;
};

export const createSpielForm = (
  fb: NonNullableFormBuilder,
  value: SpielValue
): FormGroup<SpielForm> => {
  const form = fb.group<SpielForm>({
    nummer: fb.control(value.nummer),
    obererBlock: createObererBlockForm(fb, value.obererBlock),
  });

  return form;
};

export type SpielState = {
  readonly form: FormGroup<SpielForm>;
  readonly nummer: number;
  readonly obererBlock: ObererBlockState;
};

export const mapSpielFormToState = (
  form: FormGroup<SpielForm>
): Observable<SpielState> => {
  const nummer$ = rawValueChanges(form.controls.nummer, {
    emitInitialValue: true,
  });
  const obererBlockState$ = mapObererBlockFormToState(
    form.controls.obererBlock
  );

  return combineLatest([nummer$, obererBlockState$]).pipe(
    map(([nummer, obererBlock]) => ({
      form,
      nummer,
      obererBlock,
    }))
  );
};

export class SpielService {
  readonly state$: Observable<SpielState>;

  constructor(form: FormGroup<SpielForm>) {
    this.state$ = mapSpielFormToState(form);
  }
}
