import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FrFormCacheDirective, FrFormCacheValue } from '@flensrocker/forms';

import {
  KnieFellState,
  KnieFellService,
  KnieFellValue,
  addSpiel,
  KnieFellFormGroup,
  removeSpiel,
} from './knie-fell';
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
  providers: [KnieFellService],
})
export class KnieFellComponent {
  readonly #knieFellService = inject(KnieFellService);

  readonly state$ = this.#knieFellService.state$;

  setCachedValue(cacheValue: FrFormCacheValue<KnieFellValue>): void {
    if (cacheValue.value != null) {
      this.#knieFellService.initialize(cacheValue.value);
    }
  }

  trackSpiel(_index: number, spiel: SpielState): number {
    return spiel.spielNummer;
  }

  addSpiel(form: KnieFellFormGroup): void {
    // TODO move to service
    addSpiel(this.#knieFellService.fb, form);
  }

  removeSpiel(form: KnieFellFormGroup): void {
    // TODO move to service
    removeSpiel(form);
  }

  submit(state: KnieFellState): void {
    // TODO store localStorage or similar
    this.#knieFellService.initialize();
  }

  reset(formCache: FrFormCacheDirective<KnieFellValue>): void {
    formCache.removeValue();
    this.#knieFellService.initialize();
  }
}
