import { inject, Injectable, Provider } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { combineLatest, map, Observable } from 'rxjs';

import { rawValueChanges } from '@flensrocker/forms';

import { anzahlSpiele } from './constants';
import {
  initialSpielValue,
  SpielForm,
  SpielState,
  SpielStore,
  SpielValue,
} from './spiel';

type KnieFellValue = {
  readonly name: string;
  readonly spiele: readonly SpielValue[];
};

const initialKnieFellValue: KnieFellValue = {
  name: '',
  spiele: new Array(anzahlSpiele).fill(initialSpielValue),
};

export type KnieFellForm = {
  name: FormControl<string>;
  spiele: FormArray<FormGroup<SpielForm>>;
};

const createKnieFellForm = (
  fb: NonNullableFormBuilder,
  value: KnieFellValue,
  spiele: FormGroup<SpielForm>[]
): FormGroup<KnieFellForm> => {
  const form = fb.group<KnieFellForm>({
    name: fb.control(value.name, { validators: Validators.required }),
    spiele: fb.array(spiele),
  });

  return form;
};

export type KnieFellState = {
  readonly name: string;
  readonly spiele: readonly SpielState[];
};

@Injectable()
export class KnieFellStore {
  readonly #fb = inject(NonNullableFormBuilder);

  readonly spielStores: readonly SpielStore[];
  readonly form: FormGroup<KnieFellForm>;
  readonly state$: Observable<KnieFellState>;

  constructor() {
    const value = initialKnieFellValue;
    this.spielStores = value.spiele.map(
      (spiel) => new SpielStore(this.#fb, spiel)
    );
    const spiele$ = combineLatest(
      this.spielStores.map((spielStore) => spielStore.state$)
    );

    this.form = createKnieFellForm(
      this.#fb,
      value,
      this.spielStores.map((spielStore) => spielStore.form)
    );
    const name$ = rawValueChanges(this.form.controls.name, {
      emitInitialValue: true,
    });
    this.state$ = combineLatest([name$, spiele$]).pipe(
      map(([name, spiele]) => ({ name, spiele }))
    );
  }
}

export const provideKnieFell = (): Provider[] => [KnieFellStore];
