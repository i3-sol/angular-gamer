import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SelectComponent } from './select.component';
import {
  erlaubtBeiFullHouse,
  erlaubtBeiGrosseStrasse,
  erlaubtBeiKleineStrasse,
  erlaubtBeiKnieFell,
  UntererBlockState,
} from './unterer-block';

@Component({
  selector: 'kf-unterer-block',
  templateUrl: './unterer-block.component.html',
  styleUrls: ['./global.css', './unterer-block.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, ReactiveFormsModule, SelectComponent],
})
export class UntererBlockComponent {
  readonly erlaubtBeiFullHouse = erlaubtBeiFullHouse;
  readonly erlaubtBeiKleineStrasse = erlaubtBeiKleineStrasse;
  readonly erlaubtBeiGrosseStrasse = erlaubtBeiGrosseStrasse;
  readonly erlaubtBeiKnieFell = erlaubtBeiKnieFell;

  @Input() state: UntererBlockState | null = null;
  @Input() showLabels = false;
}
