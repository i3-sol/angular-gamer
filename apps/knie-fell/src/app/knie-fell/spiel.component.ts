import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ObererBlockComponent } from './oberer-block.component';

import { SpielState } from './spiel';
import { UntererBlockComponent } from './unterer-block.component';

@Component({
  selector: 'kf-spiel',
  templateUrl: './spiel.component.html',
  styleUrls: ['./styles.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    ReactiveFormsModule,
    ObererBlockComponent,
    UntererBlockComponent,
  ],
})
export class SpielComponent {
  @Input() state: SpielState | null = null;
  @Input() showLabels = false;
}
