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
  spiele: new Array(anzahlSpiele)
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
};

export const mapKnieFellFormToState = (
  form: FormGroup<KnieFellForm>
): Observable<KnieFellState> => {
  const name$ = rawValueChanges(form.controls.name, {
    emitInitialValue: true,
  });
  const spiele$ = combineLatest(
    form.controls.spiele.controls.map((spielForm) =>
      mapSpielFormToState(spielForm)
    )
  );

  return combineLatest([name$, spiele$]).pipe(
    map(([name, spiele]) => ({ form, name, spiele }))
  );
};
