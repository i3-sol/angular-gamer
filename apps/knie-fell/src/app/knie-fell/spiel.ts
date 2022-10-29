import { NonNullableFormBuilder } from '@angular/forms';
import { combineLatest, map, Observable } from 'rxjs';

import { FormGroupOf, FormOf, rawValueChanges } from '@flensrocker/forms';

import {
  createObererBlockForm,
  initialObererBlockValue,
  ObererBlockState,
  ObererBlockValue,
  mapObererBlockFormToState,
} from './oberer-block';
import {
  createUntererBlockForm,
  initialUntererBlockValue,
  mapUntererBlockFormToState,
  UntererBlockState,
  UntererBlockValue,
} from './unterer-block';

export type SpielValue = {
  readonly nummer: number;
  readonly obererBlock: ObererBlockValue;
  readonly untererBlock: UntererBlockValue;
};
export type SpielForm = FormOf<SpielValue>;
export type SpielFormGroup = FormGroupOf<SpielValue>;

export const initialSpielValue = (nummer: number): SpielValue => ({
  nummer,
  obererBlock: initialObererBlockValue,
  untererBlock: initialUntererBlockValue,
});

export const createSpielForm = (
  fb: NonNullableFormBuilder,
  value: SpielValue
): SpielFormGroup => {
  const form = fb.group<SpielForm>({
    nummer: fb.control(value.nummer),
    obererBlock: createObererBlockForm(fb, value.obererBlock),
    untererBlock: createUntererBlockForm(fb, value.untererBlock),
  });

  return form;
};

export type SpielState = {
  readonly form: SpielFormGroup;
  readonly nummer: number;
  readonly obererBlock: ObererBlockState;
  readonly untererBlock: UntererBlockState;
  readonly summeGesamt: number;
};

export const mapSpielFormToState = (
  form: SpielFormGroup
): Observable<SpielState> => {
  const nummer$ = rawValueChanges(form.controls.nummer, {
    replayCurrentValue: true,
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
