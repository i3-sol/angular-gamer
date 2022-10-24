import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ObererBlockState } from './oberer-block';

@Component({
  selector: 'kf-oberer-block',
  templateUrl: './oberer-block.component.html',
  styleUrls: ['./styles.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, ReactiveFormsModule],
})
export class ObererBlockComponent {
  @Input() state: ObererBlockState | null = null;
  @Input() showLabels = false;
}
