import {
  AbstractControl,
  NonNullableFormBuilder,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { map, Observable } from 'rxjs';

import { FormGroupOf, FormOf, rawValueChanges } from '@flensrocker/forms';

import {
  anzahlWuerfel,
  Feld,
  gestrichen,
  getFeldValue,
  ohneEingabe,
} from './constants';

export type ObererBlockValue = {
  readonly einser: Feld;
  readonly zweier: Feld;
  readonly dreier: Feld;
  readonly vierer: Feld;
  readonly fuenfer: Feld;
  readonly sechser: Feld;
};

export type ObererBlockFormGroup = FormGroupOf<ObererBlockValue>;

type ObererBlockBonus = 0 | 35;
const obenKeinBonus: ObererBlockBonus = 0;
const obenBonus: ObererBlockBonus = 35;
const obenBonusAb = 63;

export type ObererBlockState = {
  readonly spielNummer: number;
  readonly form: ObererBlockFormGroup;
  readonly gesamt: number;
  readonly bonus: ObererBlockBonus;
  readonly gesamtObererBlock: number;
};

export const initialObererBlockValue: ObererBlockValue = {
  einser: ohneEingabe,
  zweier: ohneEingabe,
  dreier: ohneEingabe,
  vierer: ohneEingabe,
  fuenfer: ohneEingabe,
  sechser: ohneEingabe,
};

const getErlaubteWerteBeiObererBlock = (faktor: number): readonly Feld[] => {
  return new Array(anzahlWuerfel)
    .fill(null)
    .map((_, index) => (index + 1) * faktor);
};

export const erlaubtBeiEinser = getErlaubteWerteBeiObererBlock(1);
export const erlaubtBeiZweier = getErlaubteWerteBeiObererBlock(2);
export const erlaubtBeiDreier = getErlaubteWerteBeiObererBlock(3);
export const erlaubtBeiVierer = getErlaubteWerteBeiObererBlock(4);
export const erlaubtBeiFuenfer = getErlaubteWerteBeiObererBlock(5);
export const erlaubtBeiSechser = getErlaubteWerteBeiObererBlock(6);

const vielfachesVon = (faktor: number): ValidatorFn => {
  const maximum = faktor * anzahlWuerfel;

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (
      typeof value === 'number' &&
      value !== ohneEingabe &&
      value !== gestrichen
    ) {
      if (value < 0) {
        return { fehler: 'muss positiv sein' };
      }
      if (value > maximum) {
        return { fehler: `darf maximal ${maximum} sein` };
      }
      if (value % faktor !== 0) {
        return { fehler: `muss Vielfaches von ${faktor} sein` };
      }
    }
    return null;
  };
};

export const createObererBlockForm = (
  fb: NonNullableFormBuilder,
  value: ObererBlockValue
): ObererBlockFormGroup => {
  const form = fb.group<FormOf<ObererBlockValue>>({
    einser: fb.control(value.einser, { validators: [vielfachesVon(1)] }),
    zweier: fb.control(value.zweier, { validators: [vielfachesVon(2)] }),
    dreier: fb.control(value.dreier, { validators: [vielfachesVon(3)] }),
    vierer: fb.control(value.vierer, { validators: [vielfachesVon(4)] }),
    fuenfer: fb.control(value.fuenfer, { validators: [vielfachesVon(5)] }),
    sechser: fb.control(value.sechser, { validators: [vielfachesVon(6)] }),
  });

  return form;
};

const calcObererBlockGesamt = (werte: ObererBlockValue): number => {
  return (
    getFeldValue(werte.einser) +
    getFeldValue(werte.zweier) +
    getFeldValue(werte.dreier) +
    getFeldValue(werte.vierer) +
    getFeldValue(werte.fuenfer) +
    getFeldValue(werte.sechser)
  );
};

const calcObererBlockBonus = (gesamt: number): ObererBlockBonus => {
  return gesamt >= obenBonusAb ? obenBonus : obenKeinBonus;
};

const calcObererBlockGesamtObererBlock = (
  gesamt: number,
  bonus: ObererBlockBonus
): number => {
  return gesamt + bonus;
};

const calcObererBlock = (
  spielNummer: number,
  form: ObererBlockFormGroup,
  werte: ObererBlockValue
): ObererBlockState => {
  const gesamt = calcObererBlockGesamt(werte);
  const bonus = calcObererBlockBonus(gesamt);
  const gesamtObererBlock = calcObererBlockGesamtObererBlock(gesamt, bonus);

  return {
    spielNummer,
    form,
    gesamt,
    bonus,
    gesamtObererBlock,
  };
};

export const mapObererBlockFormToState = (
  spielNummer: number,
  form: ObererBlockFormGroup
): Observable<ObererBlockState> => {
  return rawValueChanges(form, {
    replayCurrentValue: true,
  }).pipe(map((werte) => calcObererBlock(spielNummer, form, werte)));
};
