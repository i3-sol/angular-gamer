import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { startWith, Subject } from 'rxjs';

import { FrFormCacheDirective, FrFormCacheValue } from '@flensrocker/forms';

import {
  addSpiel,
  initialKnieFellValue,
  KnieFellFormGroup,
  KnieFellValue,
  mapKnieFellFormToState,
  removeSpiel,
} from './knie-fell';
import { SpielState } from './spiel';
import { SpielComponent } from './spiel.component';

@Component({
  selector: 'kf-knie-fell',
  templateUrl: './knie-fell.component.html',
  styleUrls: ['./styles.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    NgForOf,
    AsyncPipe,
    ReactiveFormsModule,
    FrFormCacheDirective,
    SpielComponent,
  ],
})
export class KnieFellComponent {
  readonly #fb = inject(NonNullableFormBuilder);
  readonly #formCreationValue$ = new Subject<KnieFellValue | null>();

  readonly state$ = mapKnieFellFormToState(
    this.#fb,
    this.#formCreationValue$.pipe(startWith(initialKnieFellValue))
  );

  setCachedValue(
    cacheValue: FrFormCacheValue<KnieFellValue>,
    form: KnieFellFormGroup
  ): void {
    if (cacheValue.value.spiele.length === form.controls.spiele.length) {
      form.setValue(cacheValue.value);
    } else {
      this.#formCreationValue$.next(null);
      setTimeout(() => this.#formCreationValue$.next(cacheValue.value), 1);
    }
  }

  trackSpiel(_index: number, spiel: SpielState): number {
    return spiel.nummer;
  }

  addSpiel(form: KnieFellFormGroup): void {
    addSpiel(this.#fb, form);
  }

  removeSpiel(form: KnieFellFormGroup): void {
    removeSpiel(form);
  }
}
