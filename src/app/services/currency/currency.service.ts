import { Injectable, OnInit } from '@angular/core';

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
  index: number
}
interface CurrencyDataProvider {
  getData: () => Observable<Currencies>
  getInfo: () => SourceInfo
}


@Injectable({
  providedIn: 'root'
})
export class CurrencyService implements OnInit{

  constructor(
    private cbrJsonService: CbrJsonService,
    private cbrXmlService: CbrXmlService,
  ) { }

  private readonly dataProviders: CurrencyDataProvider[] = [
    this.cbrXmlService,
    this.cbrJsonService,
  ]
  private _dataSources: SourceInfo[] = []

  public get dataSources() {
    return this._dataSources;
  }

  public ngOnInit() {
    let priority = this.dataProviders.length;
    for(let i: number = 0; i < this.dataProviders.length; i += 1) {
      let sourceInfo = this.dataProviders[i].getInfo();
      sourceInfo.index = priority;
      this._dataSources.push(sourceInfo);
    }
  }

  public setPollingOrder(sources: SourceInfo[]): boolean {
    return false;
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
