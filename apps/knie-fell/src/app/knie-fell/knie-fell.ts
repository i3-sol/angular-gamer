import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  shareReplay,
  switchMap,
} from 'rxjs';

import { rawValueChanges } from '@flensrocker/forms';

import { maxAnzahlSpiele, minAnzahlSpiele } from './constants';
import {
  createSpielForm,
  initialSpielValue,
  mapSpielFormToState,
  SpielForm,
  SpielState,
  SpielValue,
} from './spiel';

export type KnieFellValue = {
  readonly name: string;
  readonly spiele: readonly SpielValue[];
};

export const initialKnieFellValue: KnieFellValue = {
  name: '',
  spiele: new Array(maxAnzahlSpiele)
    .fill(null)
    .map((_, index) => initialSpielValue(index + 1)),
};

export type KnieFellForm = {
  name: FormControl<string>;
  spiele: FormArray<FormGroup<SpielForm>>;
};

export const createKnieFellForm = (
  fb: NonNullableFormBuilder,
  value: KnieFellValue
): FormGroup<KnieFellForm> => {
  const form = fb.group<KnieFellForm>({
    name: fb.control(value.name, { validators: Validators.required }),
    spiele: fb.array(value.spiele.map((spiel) => createSpielForm(fb, spiel))),
  });

  return form;
};

export type KnieFellState = {
  readonly form: FormGroup<KnieFellForm>;
  readonly name: string;
  readonly spiele: readonly SpielState[];
  readonly gesamtSpiele: number;
  readonly disableRemoveSpiel: boolean;
  readonly disableAddSpiel: boolean;
};

const calcGesamtSpiele = (spiele: readonly SpielState[]): number => {
  return spiele.reduce(
    (gesamtSpiele, spiel) => (gesamtSpiele += spiel.summeGesamt),
    0
  );
};

export const mapKnieFellFormToState = (
  form: FormGroup<KnieFellForm>
): Observable<KnieFellState> => {
  const name$ = rawValueChanges(form.controls.name, {
    replayCurrentValue: true,
  });
  const spieleLength$ = rawValueChanges(form.controls.spiele, {
    replayCurrentValue: true,
  }).pipe(
    map(() => form.controls.spiele.controls.length),
    distinctUntilChanged(),
    shareReplay()
  );
  const spiele$ = spieleLength$.pipe(
    switchMap(() =>
      combineLatest(
        form.controls.spiele.controls.map((spielForm) =>
          mapSpielFormToState(spielForm)
        )
      )
    ),
    shareReplay()
  );
  const gesamtSpiele$ = spiele$.pipe(map((spiele) => calcGesamtSpiele(spiele)));
  const disableRemoveSpiel$ = spieleLength$.pipe(
    map((spieleLength) => spieleLength <= minAnzahlSpiele)
  );
  const disableAddSpiel$ = spieleLength$.pipe(
    map((spieleLength) => spieleLength >= maxAnzahlSpiele)
  );

  return combineLatest([
    name$,
    spiele$,
    gesamtSpiele$,
    disableRemoveSpiel$,
    disableAddSpiel$,
  ]).pipe(
    map(
      ([name, spiele, gesamtSpiele, disableRemoveSpiel, disableAddSpiel]) => ({
        form,
        name,
        spiele,
        gesamtSpiele,
        disableRemoveSpiel,
        disableAddSpiel,
      })
    )
  );
};

export const addSpiel = (
  fb: NonNullableFormBuilder,
  form: FormGroup<KnieFellForm>
): void => {
  const spieleLength = form.controls.spiele.length;
  if (spieleLength < maxAnzahlSpiele) {
    form.controls.spiele.push(
      createSpielForm(fb, initialSpielValue(spieleLength + 1))
    );
  }
};

export const removeSpiel = (form: FormGroup<KnieFellForm>): void => {
  const spieleLength = form.controls.spiele.length;
  if (spieleLength > minAnzahlSpiele) {
    form.controls.spiele.removeAt(spieleLength - 1);
  }
};
