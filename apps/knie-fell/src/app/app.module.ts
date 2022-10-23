import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { KnieFellComponent } from './knie-fell';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, KnieFellComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
