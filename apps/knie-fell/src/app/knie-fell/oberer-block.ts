import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { map, Observable } from 'rxjs';

import { rawValueChanges } from '@flensrocker/forms';

import { anzahlWuerfel, Feld, gestrichen, ohneEingabe } from './constants';

export type ObererBlockValue = {
  readonly einser: Feld;
  readonly zweier: Feld;
  readonly dreier: Feld;
  readonly vierer: Feld;
  readonly fuenfer: Feld;
  readonly sechser: Feld;
};

export const initialObererBlockValue: ObererBlockValue = {
  einser: ohneEingabe,
  zweier: ohneEingabe,
  dreier: ohneEingabe,
  vierer: ohneEingabe,
  fuenfer: ohneEingabe,
  sechser: ohneEingabe,
};

export type ObererBlockForm = {
  readonly einser: FormControl<Feld>;
  readonly zweier: FormControl<Feld>;
  readonly dreier: FormControl<Feld>;
  readonly vierer: FormControl<Feld>;
  readonly fuenfer: FormControl<Feld>;
  readonly sechser: FormControl<Feld>;
};

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

const createObererBlockForm = (
  fb: NonNullableFormBuilder,
  value: ObererBlockValue
): FormGroup<ObererBlockForm> => {
  const form = fb.group<ObererBlockForm>({
    einser: fb.control(value.einser, { validators: [vielfachesVon(1)] }),
    zweier: fb.control(value.zweier, { validators: [vielfachesVon(2)] }),
    dreier: fb.control(value.dreier, { validators: [vielfachesVon(3)] }),
    vierer: fb.control(value.vierer, { validators: [vielfachesVon(4)] }),
    fuenfer: fb.control(value.fuenfer, { validators: [vielfachesVon(5)] }),
    sechser: fb.control(value.sechser, { validators: [vielfachesVon(6)] }),
  });

  return form;
};

type ObererBlockBonus = 0 | 35;
const obenKeinBonus: ObererBlockBonus = 0;
const obenBonus: ObererBlockBonus = 35;
const obenBonusAb = 63;

export type ObererBlockState = {
  readonly werte: ObererBlockValue;
  readonly gesamt: number;
  readonly bonus: ObererBlockBonus;
  readonly gesamtObererBlock: number;
};

const calcObererBlockGesamt = (werte: ObererBlockValue): number => {
  return (
    (werte.einser ?? 0) +
    (werte.zweier ?? 0) +
    (werte.dreier ?? 0) +
    (werte.vierer ?? 0) +
    (werte.fuenfer ?? 0) +
    (werte.sechser ?? 0)
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

const calcObererBlock = (werte: ObererBlockValue): ObererBlockState => {
  const gesamt = calcObererBlockGesamt(werte);
  const bonus = calcObererBlockBonus(gesamt);
  const gesamtObererBlock = calcObererBlockGesamtObererBlock(gesamt, bonus);

  return {
    werte,
    gesamt,
    bonus,
    gesamtObererBlock,
  };
};

export class ObererBlockStore {
  readonly form: FormGroup<ObererBlockForm>;
  readonly state$: Observable<ObererBlockState>;

  constructor(readonly fb: NonNullableFormBuilder, value: ObererBlockValue) {
    this.form = createObererBlockForm(fb, value);
    this.state$ = rawValueChanges(this.form, {
      emitInitialValue: true,
    }).pipe(map((werte) => calcObererBlock(werte)));
  }
}
