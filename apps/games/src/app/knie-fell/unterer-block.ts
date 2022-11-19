import {
  AbstractControl,
  NonNullableFormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { map, Observable } from 'rxjs';

import { FormGroupOf, FormOf, rawValueChanges } from '@flensrocker/forms';

import { Feld, gestrichen, getFeldValue, ohneEingabe } from './constants';

export type UntererBlockValue = {
  readonly dreierpasch: Feld;
  readonly viererpasch: Feld;
  readonly fullHouse: Feld;
  readonly kleineStrasse: Feld;
  readonly grosseStrasse: Feld;
  readonly knieFell: Feld;
  readonly chance: Feld;
};

export type UntererBlockFormGroup = FormGroupOf<UntererBlockValue>;

export type UntererBlockState = {
  readonly spielNummer: number;
  readonly form: UntererBlockFormGroup;
  readonly werte: UntererBlockValue;
  readonly gesamtUntererBlock: number;
};

export const initialUntererBlockValue: UntererBlockValue = {
  dreierpasch: ohneEingabe,
  viererpasch: ohneEingabe,
  fullHouse: ohneEingabe,
  kleineStrasse: ohneEingabe,
  grosseStrasse: ohneEingabe,
  knieFell: ohneEingabe,
  chance: ohneEingabe,
};

export const erlaubtBeiFullHouse = [25];
export const erlaubtBeiKleineStrasse = [30];
export const erlaubtBeiGrosseStrasse = [40];
export const erlaubtBeiKnieFell = [50];

const exaktGleich = (erlaubt: number): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (
      typeof value === 'number' &&
      value !== ohneEingabe &&
      value !== gestrichen
    ) {
      if (erlaubt !== value) {
        return { fehler: `muss ${erlaubt} sein` };
      }
    }
    return null;
  };
};

export const createUntererBlockForm = (
  fb: NonNullableFormBuilder,
  value: UntererBlockValue
): UntererBlockFormGroup => {
  const form = fb.group<FormOf<UntererBlockValue>>({
    dreierpasch: fb.control(value.dreierpasch, {
      validators: [Validators.min(5), Validators.max(30)],
    }),
    viererpasch: fb.control(value.viererpasch, {
      validators: [Validators.min(5), Validators.max(30)],
    }),
    fullHouse: fb.control(value.fullHouse, { validators: [exaktGleich(25)] }),
    kleineStrasse: fb.control(value.kleineStrasse, {
      validators: [exaktGleich(30)],
    }),
    grosseStrasse: fb.control(value.grosseStrasse, {
      validators: [exaktGleich(40)],
    }),
    knieFell: fb.control(value.knieFell, { validators: [exaktGleich(50)] }),
    chance: fb.control(value.chance, {
      validators: [Validators.min(5), Validators.max(30)],
    }),
  });

  return form;
};

const calcUntererBlockGesamt = (werte: UntererBlockValue): number => {
  return (
    getFeldValue(werte.dreierpasch) +
    getFeldValue(werte.viererpasch) +
    getFeldValue(werte.fullHouse) +
    getFeldValue(werte.kleineStrasse) +
    getFeldValue(werte.grosseStrasse) +
    getFeldValue(werte.knieFell) +
    getFeldValue(werte.chance)
  );
};

const calcUntererBlock = (
  spielNummer: number,
  form: UntererBlockFormGroup,
  werte: UntererBlockValue
): UntererBlockState => {
  const gesamtUntererBlock = calcUntererBlockGesamt(werte);

  return {
    spielNummer,
    form,
    werte,
    gesamtUntererBlock,
  };
};

export const mapUntererBlockFormToState = (
  spielNummer: number,
  form: UntererBlockFormGroup
): Observable<UntererBlockState> => {
  return rawValueChanges(form, {
    replayCurrentValue: true,
  }).pipe(map((werte) => calcUntererBlock(spielNummer, form, werte)));
};
