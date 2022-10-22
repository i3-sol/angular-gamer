import { ChangeDetectionStrategy, inject } from '@angular/core';
import { Component } from '@angular/core';
import { KnieFellStore, provideKnieFell } from './knie-fell';

@Component({
  selector: 'kf-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideKnieFell()],
})
export class AppComponent {
  readonly #store = inject(KnieFellStore);

  readonly form = this.#store.form;
  readonly state$ = this.#store.state$;
}
