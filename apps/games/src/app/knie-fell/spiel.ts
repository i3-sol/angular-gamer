import { NonNullableFormBuilder } from '@angular/forms';
import { combineLatest, map, Observable, of, shareReplay } from 'rxjs';

import { FormGroupOf, FormOf } from '@flensrocker/forms';

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
  readonly obererBlock: ObererBlockValue;
  readonly untererBlock: UntererBlockValue;
};

export type SpielFormGroup = FormGroupOf<SpielValue>;

export type SpielState = {
  readonly form: SpielFormGroup;
  readonly spielNummer: number;
  readonly obererBlock: ObererBlockState;
  readonly untererBlock: UntererBlockState;
  readonly summeGesamt: number;
};

export const initialSpielValue: SpielValue = {
  obererBlock: initialObererBlockValue,
  untererBlock: initialUntererBlockValue,
};

export const createSpielForm = (
  fb: NonNullableFormBuilder,
  value: SpielValue
): SpielFormGroup => {
  const form = fb.group<FormOf<SpielValue>>({
    obererBlock: createObererBlockForm(fb, value.obererBlock),
    untererBlock: createUntererBlockForm(fb, value.untererBlock),
  });

  return form;
};

export const mapSpielFormToState = (
  spielNummer: number,
  form: SpielFormGroup
): Observable<SpielState> => {
  const obererBlockState$ = mapObererBlockFormToState(
    spielNummer,
    form.controls.obererBlock
  ).pipe(shareReplay());
  const untererBlockState$ = mapUntererBlockFormToState(
    spielNummer,
    form.controls.untererBlock
  ).pipe(shareReplay());

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

  return combineLatest({
    form: of(form),
    spielNummer: of(spielNummer),
    obererBlock: obererBlockState$,
    untererBlock: untererBlockState$,
    summeGesamt: summeGesamt$,
  });
};
