import { inject, Injectable } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

type OhneEingabe = null;
const ohneEingabe: OhneEingabe = null;

type Gestrichen = 0;
const gestrichen: Gestrichen = 0;

type Feld = OhneEingabe | Gestrichen | number;

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
  fb: NonNullableFormBuilder
): FormGroup<ObererBlockForm> => {
  const form = fb.group<ObererBlockForm>({
    einser: fb.control(ohneEingabe, { validators: [vielfachesVon(1)] }),
    zweier: fb.control(ohneEingabe, { validators: [vielfachesVon(2)] }),
    dreier: fb.control(ohneEingabe, { validators: [vielfachesVon(3)] }),
    vierer: fb.control(ohneEingabe, { validators: [vielfachesVon(4)] }),
    fuenfer: fb.control(ohneEingabe, { validators: [vielfachesVon(5)] }),
    sechser: fb.control(ohneEingabe, { validators: [vielfachesVon(6)] }),
  });

  return form;
};

type ObererBlockBonus = 0 | 35;
const obenKeinBonus: ObererBlockBonus = 0;
const obenBonus: ObererBlockBonus = 35;

type ObererBlockState = {
  readonly form: FormGroup<ObererBlockForm>;
  readonly gesamt: number;
  readonly bonus: ObererBlockBonus;
  readonly gesamtObererBlock: number;
};

const leererObererBlock = (fb: NonNullableFormBuilder): ObererBlockState => ({
  form: createObererBlockForm(fb),
  gesamt: 0,
  bonus: obenKeinBonus,
  gesamtObererBlock: 0,
});

class ObererBlockStore {
  readonly #store: BehaviorSubject<ObererBlockState>;
  readonly state$: Observable<ObererBlockState>;

  constructor(fb: NonNullableFormBuilder) {
    this.#store = new BehaviorSubject<ObererBlockState>(leererObererBlock(fb));
    this.state$ = this.#store.asObservable();
  }
}

@Injectable({
  providedIn: 'root',
})
export class KnieFellStore {
  readonly #fb = inject(NonNullableFormBuilder);
  readonly obererBlock = new ObererBlockStore(this.#fb);
}
