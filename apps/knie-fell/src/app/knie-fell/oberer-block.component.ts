import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ObererBlockStore } from './oberer-block';

@Component({
  selector: 'kf-oberer-block',
  templateUrl: './oberer-block.component.html',
  styleUrls: ['./styles.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, AsyncPipe, JsonPipe, ReactiveFormsModule],
})
export class ObererBlockComponent {
  @Input() store: ObererBlockStore | null = null;
  @Input() showLabels = false;
}
