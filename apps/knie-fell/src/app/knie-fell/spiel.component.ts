import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ObererBlockComponent } from './oberer-block.component';

import { SpielStore } from './spiel';

@Component({
  selector: 'kf-spiel',
  templateUrl: './spiel.component.html',
  styleUrls: ['./styles.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, AsyncPipe, ReactiveFormsModule, ObererBlockComponent],
})
export class SpielComponent {
  @Input() store: SpielStore | null = null;
}
