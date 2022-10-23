import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { combineLatest, map, Observable } from 'rxjs';

import {
  initialObererBlockValue,
  ObererBlockForm,
  ObererBlockState,
  ObererBlockStore,
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
  obererBlock: FormGroup<ObererBlockForm>;
};

const createSpielForm = (
  fb: NonNullableFormBuilder,
  obererBlock: FormGroup<ObererBlockForm>
): FormGroup<SpielForm> => {
  const form = fb.group<SpielForm>({
    obererBlock,
  });

  return form;
};

export type SpielState = {
  readonly nummer: number;
  readonly showLabels: boolean;
  readonly obererBlock: ObererBlockState;
};

export class SpielStore {
  readonly nummer: number;
  readonly obererBlockStore: ObererBlockStore;
  readonly form: FormGroup<SpielForm>;
  readonly state$: Observable<SpielState>;

  constructor(readonly fb: NonNullableFormBuilder, value: SpielValue) {
    this.nummer = value.nummer;
    this.obererBlockStore = new ObererBlockStore(fb, value.obererBlock);
    this.form = createSpielForm(fb, this.obererBlockStore.form);
    this.state$ = combineLatest([this.obererBlockStore.state$]).pipe(
      map(([obererBlock]) => ({
        nummer: value.nummer,
        showLabels: value.nummer === 1,
        obererBlock,
      }))
    );
  }
}
