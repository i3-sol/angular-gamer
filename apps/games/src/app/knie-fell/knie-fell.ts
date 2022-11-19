import { NonNullableFormBuilder, Validators } from '@angular/forms';
import {
  asapScheduler,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  observeOn,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs';

import { FormGroupOf, FormOf, rawValueChanges } from '@flensrocker/forms';

import { maxAnzahlSpiele, minAnzahlSpiele } from './constants';
import {
  createSpielForm,
  initialSpielValue,
  mapSpielFormToState,
  SpielState,
  SpielValue,
} from './spiel';
import { inject, Injectable, OnDestroy } from '@angular/core';

export type KnieFellValue = {
  readonly name: string;
  readonly spiele: SpielValue[];
};
export type KnieFellForm = FormOf<KnieFellValue>;
export type KnieFellFormGroup = FormGroupOf<KnieFellValue>;

export const initialKnieFellValue: KnieFellValue = {
  name: '',
  spiele: new Array(maxAnzahlSpiele).fill(null).map((_) => initialSpielValue()),
};

export const createKnieFellForm = (
  fb: NonNullableFormBuilder,
  value: KnieFellValue
): KnieFellFormGroup => {
  const form = fb.group<KnieFellForm>({
    name: fb.control(value.name, { validators: Validators.required }),
    spiele: fb.array(value.spiele.map((spiel) => createSpielForm(fb, spiel))),
  });

  return form;
};

export type KnieFellState = {
  readonly form: KnieFellFormGroup;
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
  fb: NonNullableFormBuilder,
  formValue: KnieFellValue
): Observable<KnieFellState> => {
  const form = createKnieFellForm(fb, formValue);
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
        form.controls.spiele.controls.map((spielForm, spielIndex) =>
          mapSpielFormToState(spielIndex + 1, spielForm)
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

  return combineLatest({
    form: of(form),
    name: name$,
    spiele: spiele$,
    gesamtSpiele: gesamtSpiele$,
    disableRemoveSpiel: disableRemoveSpiel$,
    disableAddSpiel: disableAddSpiel$,
  });
};

const addSpiel = (
  fb: NonNullableFormBuilder,
  form: KnieFellFormGroup
): void => {
  const spieleLength = form.controls.spiele.length;
  if (spieleLength < maxAnzahlSpiele) {
    form.controls.spiele.push(createSpielForm(fb, initialSpielValue()));
    form.markAsDirty();
  }
};

const removeSpiel = (form: KnieFellFormGroup): void => {
  const spieleLength = form.controls.spiele.length;
  if (spieleLength > minAnzahlSpiele) {
    form.controls.spiele.removeAt(spieleLength - 1);
    form.markAsDirty();
  }
};

type KnieFellEffect = {
  (state: KnieFellState): void;
};

@Injectable()
export class KnieFellService implements OnDestroy {
  readonly #destroyed = new Subject<void>();
  readonly #formCreationValue$ = new Subject<KnieFellValue>();
  readonly #effect$ = new Subject<KnieFellEffect>();

  readonly fb = inject(NonNullableFormBuilder);
  readonly state$: Observable<KnieFellState> = this.#formCreationValue$.pipe(
    startWith(initialKnieFellValue),
    switchMap((formCreationValue) =>
      mapKnieFellFormToState(this.fb, formCreationValue)
    ),
    takeUntil(this.#destroyed),
    shareReplay({ bufferSize: 1, refCount: true }),
    observeOn(asapScheduler)
  );

  constructor() {
    this.#effect$
      .pipe(withLatestFrom(this.state$), takeUntil(this.#destroyed))
      .subscribe({ next: ([effect, state]) => effect(state) });
  }

  ngOnDestroy(): void {
    this.#destroyed.next();
    this.#destroyed.complete();
  }

  initialize(formValue?: KnieFellValue): void {
    this.#formCreationValue$.next(formValue ?? initialKnieFellValue);
  }

  addSpiel(): void {
    this.#effect$.next((state) => addSpiel(this.fb, state.form));
  }

  removeSpiel(): void {
    this.#effect$.next((state) => removeSpiel(state.form));
  }
}
