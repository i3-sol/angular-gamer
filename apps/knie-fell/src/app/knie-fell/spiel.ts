import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { rawValueChanges } from '@flensrocker/forms';
import { combineLatest, map, Observable } from 'rxjs';

import {
  createObererBlockForm,
  initialObererBlockValue,
  ObererBlockForm,
  ObererBlockState,
  ObererBlockService,
  ObererBlockValue,
} from './oberer-block';

export type SpielValue = {
  readonly nummer: number;
  readonly obererBlock: ObererBlockValue;
};

export const initialSpielValue = (nummer: number): SpielValue => ({
  nummer,
  obererBlock: initialObererBlockValue,
});

export type SpielForm = {
  nummer: FormControl<number>;
  obererBlock: FormGroup<ObererBlockForm>;
};

export const createSpielForm = (
  fb: NonNullableFormBuilder,
  value: SpielValue
): FormGroup<SpielForm> => {
  const form = fb.group<SpielForm>({
    nummer: fb.control(value.nummer),
    obererBlock: createObererBlockForm(fb, value.obererBlock),
  });

  return form;
};

export type SpielState = {
  readonly nummer: number;
  readonly obererBlock: ObererBlockState;
};

export class SpielService {
  readonly obererBlockService: ObererBlockService;
  readonly state$: Observable<SpielState>;

  constructor(form: FormGroup<SpielForm>) {
    this.obererBlockService = new ObererBlockService(form.controls.obererBlock);
    const nummer$ = rawValueChanges(form.controls.nummer, {
      emitInitialValue: true,
    });
    this.state$ = combineLatest([nummer$, this.obererBlockService.state$]).pipe(
      map(([nummer, obererBlock]) => ({
        nummer,
        obererBlock,
      }))
    );
  }
}
