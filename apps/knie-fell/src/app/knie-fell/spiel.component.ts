import { AsyncPipe, NgIf } from '@angular/common';
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
import { ObererBlockComponent } from './oberer-block.component';

import { SpielForm, SpielService } from './spiel';

@Component({
  selector: 'kf-spiel',
  templateUrl: './spiel.component.html',
  styleUrls: ['./styles.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, AsyncPipe, ReactiveFormsModule, ObererBlockComponent],
})
export class SpielComponent {
  readonly #controlContainer = inject(ControlContainer);

  get spielForm(): FormGroup<SpielForm> | null {
    return this.#controlContainer.control as FormGroup<SpielForm> | null;
  }

  @Input() spielService: SpielService | null = null;
  @Input() showLabels = false;
}
