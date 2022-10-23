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
  readonly obererBlock: ObererBlockValue;
};

export const initialSpielValue: SpielValue = {
  obererBlock: initialObererBlockValue,
};

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
  readonly obererBlock: ObererBlockState;
};

export class SpielStore {
  readonly obererBlockStore: ObererBlockStore;
  readonly form: FormGroup<SpielForm>;
  readonly state$: Observable<SpielState>;

  constructor(readonly fb: NonNullableFormBuilder, value: SpielValue) {
    this.obererBlockStore = new ObererBlockStore(fb, value.obererBlock);
    this.form = createSpielForm(fb, this.obererBlockStore.form);
    this.state$ = combineLatest([this.obererBlockStore.state$]).pipe(
      map(([obererBlock]) => ({ obererBlock }))
    );
  }
}
