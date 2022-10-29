import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FrFormCacheDirective } from '@flensrocker/forms';

import {
  addSpiel,
  createKnieFellForm,
  initialKnieFellValue,
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
  readonly #form = createKnieFellForm(this.#fb, initialKnieFellValue);

  readonly state$ = mapKnieFellFormToState(this.#form);

  setCachedValue(cachedValue: KnieFellValue): void {
    if (cachedValue.spiele.length > 0) {
      while (this.#form.controls.spiele.length < cachedValue.spiele.length) {
        this.addSpiel();
      }
      while (this.#form.controls.spiele.length > cachedValue.spiele.length) {
        this.removeSpiel();
      }
      // trigger change detection
      setTimeout(() => {
        this.#form.setValue(cachedValue);
      }, 0);
    }
  }

  trackSpiel(_index: number, spiel: SpielState): number {
    return spiel.nummer;
  }

  addSpiel(): void {
    addSpiel(this.#fb, this.#form);
  }

  removeSpiel(): void {
    removeSpiel(this.#form);
  }
}
