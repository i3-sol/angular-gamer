import { Routes } from '@angular/router';

import { KnieFellComponent } from './knie-fell.component';

export const KNIEFELL_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: KnieFellComponent,
  },
];

export * from './knie-fell.component';
