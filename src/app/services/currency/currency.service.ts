import { Injectable } from '@angular/core';

import { Observable, onErrorResumeNext, of, interval } from "rxjs";
import { first, catchError } from "rxjs/operators";

import { CbrJsonService } from "./data-providers/cbr-json.service";
import { CbrXmlService } from "./data-providers/cbr-xml.service";


export interface Currency {
  charCode: string
  name: string
  nominal: number
  value: number
  previousValue: number | null
}
export interface Currencies {
  sourceUrl: string
  sourceName: string
  timestamp: number
  previousTimestamp: number | null
  base: string
  quotes: {
    [currencyCode: string]: Currency
  }
}
export interface SourceInfo {
  name: string
  url: string
}
interface CurrencyDataProvider {
  getData: () => Observable<Currencies>
  getInfo: () => SourceInfo
}


@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  constructor(
    private cbrJsonService: CbrJsonService,
    private cbrXmlService: CbrXmlService,
  ) { }

  private readonly dataProviders: CurrencyDataProvider[] = [
    this.cbrXmlService,
    this.cbrJsonService,
  ]

  public getSourcesInfo(): SourceInfo[] {
    let res: SourceInfo[] = [];
    for(let dataProviderService of this.dataProviders)
      res.push(dataProviderService.getInfo());
    return res;
  }

  public polling(intervalValue: number): Observable<Currencies | null | string> {
    return new Observable<Currencies | null | string>(subscriber => {
      interval(intervalValue).subscribe({
        next: () => {
          subscriber.next('update');
          this.getData().subscribe(
            (data) => {
              subscriber.next(data);
            }
          );
        }
      });
    })
  }

  public getData(): Observable<Currencies | null> {
    // this.cbrXmlService.getData().subscribe(result => {console.log(result)});
    return onErrorResumeNext(...this.dataProviders.map(dataProviderService => dataProviderService.getData())).pipe(
      first(),
      catchError(err => {
        console.error(err);
        return of(null);
      })
    );
  }

}
