import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from '@angular/core';
import {
  ControlContainer,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { ObererBlockForm, ObererBlockService } from './oberer-block';

@Component({
  selector: 'kf-oberer-block',
  templateUrl: './oberer-block.component.html',
  styleUrls: ['./styles.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, AsyncPipe, JsonPipe, ReactiveFormsModule],
})
export class ObererBlockComponent {
  readonly #controlContainer = inject(ControlContainer);

  get obererBlockForm(): FormGroup<ObererBlockForm> | null {
    return this.#controlContainer.control as FormGroup<ObererBlockForm> | null;
  }

  @Input() obererBlockService: ObererBlockService | null = null;
  @Input() showLabels = false;
}
