import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { UntererBlockState } from './unterer-block';

@Component({
  selector: 'kf-unterer-block',
  templateUrl: './unterer-block.component.html',
  styleUrls: ['./styles.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, ReactiveFormsModule],
})
export class UntererBlockComponent {
  @Input() state: UntererBlockState | null = null;
  @Input() showLabels = false;
}
