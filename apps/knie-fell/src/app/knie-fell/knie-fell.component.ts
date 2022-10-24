import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { KnieFellService, provideKnieFell } from './knie-fell';
import { SpielState } from './spiel';
import { SpielComponent } from './spiel.component';

@Component({
  selector: 'kf-knie-fell',
  templateUrl: './knie-fell.component.html',
  styleUrls: ['./styles.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgForOf, AsyncPipe, ReactiveFormsModule, SpielComponent],
  providers: [provideKnieFell()],
})
export class KnieFellComponent {
  readonly knieFellService = inject(KnieFellService);

  trackSpiel(_index: number, spiel: SpielState): number {
    return spiel.nummer;
  }
}
