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
  readonly summeGesamt: number;
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
  const summeGesamt$ = combineLatest([
    obererBlockState$.pipe(map((obererBlock) => obererBlock.gesamtObererBlock)),
    untererBlockState$.pipe(
      map((untererBlock) => untererBlock.gesamtUntererBlock)
    ),
  ]).pipe(
    map(
      ([gesamtObererBlock, gesamtUntererBlock]) =>
        gesamtObererBlock + gesamtUntererBlock
    )
  );

  return combineLatest([
    nummer$,
    obererBlockState$,
    untererBlockState$,
    summeGesamt$,
  ]).pipe(
    map(([nummer, obererBlock, untererBlock, summeGesamt]) => ({
      form,
      nummer,
      obererBlock,
      untererBlock,
      summeGesamt,
    }))
  );
};
