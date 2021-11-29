import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";

import { AppComponent } from './app.component';
import { CurrencyViewComponent } from './components/currency-view/currency-view.component';
import { CurrencySourcesListViewComponent } from './components/currency-view/currency-sources-list-view/currency-sources-list-view.component';

@NgModule({
  declarations: [
    AppComponent,
    CurrencyViewComponent,
    CurrencySourcesListViewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
