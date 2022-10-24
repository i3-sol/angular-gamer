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
import {
  createUntererBlockForm,
  initialUntererBlockValue,
  mapUntererBlockFormToState,
  UntererBlockForm,
  UntererBlockState,
  UntererBlockValue,
} from './unterer-block';

export type SpielValue = {
  readonly nummer: number;
  readonly obererBlock: ObererBlockValue;
  readonly untererBlock: UntererBlockValue;
};

export const initialSpielValue = (nummer: number): SpielValue => ({
  nummer,
  obererBlock: initialObererBlockValue,
  untererBlock: initialUntererBlockValue,
});

export type SpielForm = {
  nummer: FormControl<number>;
  obererBlock: FormGroup<ObererBlockForm>;
  untererBlock: FormGroup<UntererBlockForm>;
};

export const createSpielForm = (
  fb: NonNullableFormBuilder,
  value: SpielValue
): FormGroup<SpielForm> => {
  const form = fb.group<SpielForm>({
    nummer: fb.control(value.nummer),
    obererBlock: createObererBlockForm(fb, value.obererBlock),
    untererBlock: createUntererBlockForm(fb, value.untererBlock),
  });

  return form;
};

export type SpielState = {
  readonly form: FormGroup<SpielForm>;
  readonly nummer: number;
  readonly obererBlock: ObererBlockState;
  readonly untererBlock: UntererBlockState;
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
  const untererBlockState$ = mapUntererBlockFormToState(
    form.controls.untererBlock
  );

  return combineLatest([nummer$, obererBlockState$, untererBlockState$]).pipe(
    map(([nummer, obererBlock, untererBlock]) => ({
      form,
      nummer,
      obererBlock,
      untererBlock,
    }))
  );
};
