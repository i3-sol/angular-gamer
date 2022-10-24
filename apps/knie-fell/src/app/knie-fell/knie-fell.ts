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
  createSpielForm,
  initialSpielValue,
  SpielForm,
  SpielService,
  SpielState,
  SpielValue,
} from './spiel';

type KnieFellValue = {
  readonly name: string;
  readonly spiele: readonly SpielValue[];
};

const initialKnieFellValue: KnieFellValue = {
  name: '',
  spiele: new Array(anzahlSpiele)
    .fill(null)
    .map((_, index) => initialSpielValue(index + 1)),
};

export type KnieFellForm = {
  name: FormControl<string>;
  spiele: FormArray<FormGroup<SpielForm>>;
};

const createKnieFellForm = (
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
  readonly name: string;
  readonly spiele: readonly SpielState[];
};

@Injectable()
export class KnieFellService {
  readonly #fb = inject(NonNullableFormBuilder);

  readonly form: FormGroup<KnieFellForm>;
  readonly spielServices: readonly SpielService[];
  readonly state$: Observable<KnieFellState>;

  constructor() {
    this.form = createKnieFellForm(this.#fb, initialKnieFellValue);
    this.spielServices = this.form.controls.spiele.controls.map(
      (spielForm) => new SpielService(spielForm)
    );
    const spiele$ = combineLatest(
      this.spielServices.map((spielService) => spielService.state$)
    );

    const name$ = rawValueChanges(this.form.controls.name, {
      emitInitialValue: true,
    });
    this.state$ = combineLatest([name$, spiele$]).pipe(
      map(([name, spiele]) => ({ name, spiele }))
    );
  }
}

export const provideKnieFell = (): Provider[] => [KnieFellService];
