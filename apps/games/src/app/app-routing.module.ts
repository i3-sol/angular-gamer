import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const ROUTES: Routes = [
  {
    path: 'knie-fell',
    loadChildren: () => import('./knie-fell').then((m) => m.KNIEFELL_ROUTES),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'knie-fell',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(ROUTES)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
