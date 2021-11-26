import { Injectable } from '@angular/core';

import { Observable, onErrorResumeNext, of } from "rxjs";
import { first, catchError } from "rxjs/operators";

import { CbrJsonService } from "./data-providers/cbr-json.service";
import { CbrXmlService } from "./data-providers/cbr-xml.service";


export interface Currency {
  [currencyCode: string]: {
    charCode: string
    name: string
    nominal: number
    value: number
    previousValue: number | null
  }
}
export interface Currencies {
  sourceUrl: string
  timestamp: number
  previousTimestamp: number | null
  base: string
  quotes: Currency
}

type CurrencyGetter = () => Observable<Currencies>;


@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  constructor(
    private cbrJsonService: CbrJsonService,
    private cbrXmlService: CbrXmlService,
  ) { }

  private readonly getters: CurrencyGetter[] = [
    this.cbrXmlService.getData.bind(this.cbrXmlService),
    this.cbrJsonService.getData.bind(this.cbrJsonService),
  ]

  public getData(): Observable<Currencies | null> {
    // this.cbrXmlService.getData().subscribe(result => {console.log(result)});
    return onErrorResumeNext(...this.getters.map(getter => getter())).pipe(
      first(),
      catchError(err => {
        console.error(err);
        return of(null);
      })
    );
  }

}
