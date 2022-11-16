import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
  erlaubtBeiDreier,
  erlaubtBeiEinser,
  erlaubtBeiFuenfer,
  erlaubtBeiSechser,
  erlaubtBeiVierer,
  erlaubtBeiZweier,
  ObererBlockState,
} from './oberer-block';
import { SelectComponent } from './select.component';

@Component({
  selector: 'kf-oberer-block',
  templateUrl: './oberer-block.component.html',
  styleUrls: ['./global.css', './oberer-block.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, ReactiveFormsModule, SelectComponent],
})
export class ObererBlockComponent {
  readonly erlaubtBeiEinser = erlaubtBeiEinser;
  readonly erlaubtBeiZweier = erlaubtBeiZweier;
  readonly erlaubtBeiDreier = erlaubtBeiDreier;
  readonly erlaubtBeiVierer = erlaubtBeiVierer;
  readonly erlaubtBeiFuenfer = erlaubtBeiFuenfer;
  readonly erlaubtBeiSechser = erlaubtBeiSechser;

  @Input() state: ObererBlockState | null = null;
  @Input() showLabels = false;
}
