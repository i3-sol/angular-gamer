import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
  FrFormCacheDirective,
  FrFormCacheValue,
  provideLocalStorageFormCache,
} from '@flensrocker/forms';

import { KnieFellState, KnieFellService, KnieFellValue } from './knie-fell';
import { SpielState } from './spiel';
import { SpielComponent } from './spiel.component';

@Component({
  selector: 'kf-knie-fell',
  templateUrl: './knie-fell.component.html',
  styleUrls: ['./global.css', './knie-fell.component.css'],
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
  providers: [KnieFellService, provideLocalStorageFormCache()],
})
export class KnieFellComponent {
  readonly #knieFellService = inject(KnieFellService);

  readonly state$ = this.#knieFellService.state$;

  setCachedValue(cacheValue: FrFormCacheValue<KnieFellValue>): void {
    if (cacheValue.value != null) {
      this.#knieFellService.setValue(cacheValue.value);
    }
  }

  trackSpiel(_index: number, spiel: SpielState): number {
    return spiel.spielNummer;
  }

  addSpiel(): void {
    this.#knieFellService.addSpiel();
  }

  removeSpiel(): void {
    this.#knieFellService.removeSpiel();
  }

  submit(state: KnieFellState): void {
    // TODO store localStorage or similar
    this.#knieFellService.setValue();
  }

  reset(formCache: FrFormCacheDirective<KnieFellValue>): void {
    if (confirm('Sollen alle Eingaben gelöscht werden?')) {
      formCache.removeValue();
      this.#knieFellService.setValue();
    }
  }
}
