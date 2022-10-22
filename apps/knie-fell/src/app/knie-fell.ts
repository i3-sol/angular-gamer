import { inject, Injectable, OnDestroy, Provider } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { combineLatest, map, Observable, Subject, takeUntil } from 'rxjs';
import { rawValueChanges } from './forms';

type OhneEingabe = null;
const ohneEingabe: OhneEingabe = null;

type Gestrichen = 0;
const gestrichen: Gestrichen = 0;

type Feld = OhneEingabe | Gestrichen | number;

type ObererBlockValue = {
  readonly einser: Feld;
  readonly zweier: Feld;
  readonly dreier: Feld;
  readonly vierer: Feld;
  readonly fuenfer: Feld;
  readonly sechser: Feld;
};

const initialObererBlockValue: ObererBlockValue = {
  einser: ohneEingabe,
  zweier: ohneEingabe,
  dreier: ohneEingabe,
  vierer: ohneEingabe,
  fuenfer: ohneEingabe,
  sechser: ohneEingabe,
};

type ObererBlockForm = {
  readonly einser: FormControl<Feld>;
  readonly zweier: FormControl<Feld>;
  readonly dreier: FormControl<Feld>;
  readonly vierer: FormControl<Feld>;
  readonly fuenfer: FormControl<Feld>;
  readonly sechser: FormControl<Feld>;
};

const vielfachesVon = (faktor: number): ValidatorFn => {
  const maximum = faktor * 5;

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
  werte: ObererBlockValue
): FormGroup<ObererBlockForm> => {
  const form = fb.group<ObererBlockForm>({
    einser: fb.control(werte.einser, { validators: [vielfachesVon(1)] }),
    zweier: fb.control(werte.zweier, { validators: [vielfachesVon(2)] }),
    dreier: fb.control(werte.dreier, { validators: [vielfachesVon(3)] }),
    vierer: fb.control(werte.vierer, { validators: [vielfachesVon(4)] }),
    fuenfer: fb.control(werte.fuenfer, { validators: [vielfachesVon(5)] }),
    sechser: fb.control(werte.sechser, { validators: [vielfachesVon(6)] }),
  });

  return form;
};

type ObererBlockBonus = 0 | 35;
const obenKeinBonus: ObererBlockBonus = 0;
const obenBonus: ObererBlockBonus = 35;
const obenBonusAb = 63;

type ObererBlockState = {
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

@Injectable()
class ObererBlockStore implements OnDestroy {
  readonly #destroyed = new Subject<void>();
  readonly #fb = inject(NonNullableFormBuilder);

  readonly form = createObererBlockForm(this.#fb, initialObererBlockValue);
  readonly state$ = rawValueChanges(this.form).pipe(
    map((werte) => calcObererBlock(werte)),
    takeUntil(this.#destroyed)
  );

  ngOnDestroy(): void {
    this.#destroyed.next();
    this.#destroyed.complete();
  }
}

type KnieFellForm = {
  obererBlock: FormGroup<ObererBlockForm>;
};

export type KnieFellState = {
  readonly obererBlock: ObererBlockState;
};

@Injectable()
export class KnieFellStore implements OnDestroy {
  readonly #destroyed = new Subject<void>();
  readonly #fb = inject(NonNullableFormBuilder);
  readonly #obererBlock = inject(ObererBlockStore);

  readonly form = this.#fb.group<KnieFellForm>({
    obererBlock: this.#obererBlock.form,
  });
  readonly state$: Observable<KnieFellState> = combineLatest([
    this.#obererBlock.state$,
  ]).pipe(
    map(([obererBlock]) => ({ obererBlock })),
    takeUntil(this.#destroyed)
  );

  ngOnDestroy(): void {
    this.#destroyed.next();
    this.#destroyed.complete();
  }
}

export const provideKnieFell = (): Provider[] => [
  ObererBlockStore,
  KnieFellStore,
];
