import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { KnieFellStore, provideKnieFell } from './knie-fell';
import { SpielStore } from './spiel';
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
  readonly store = inject(KnieFellStore);

  trackSpiel(_index: number, spielStore: SpielStore): number {
    return spielStore.nummer;
  }
}
