import { ChangeDetectionStrategy, inject } from '@angular/core';
import { Component } from '@angular/core';
import { KnieFellStore } from './knie-fell.types';

@Component({
  selector: 'kf-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly #store = inject(KnieFellStore);
}
