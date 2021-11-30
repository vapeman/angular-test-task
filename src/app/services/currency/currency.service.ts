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
  index: number
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
  ) {
    this.onInit();
  }

  private readonly dataProviders: CurrencyDataProvider[] = [
    this.cbrXmlService,
    this.cbrJsonService,
  ]
  private _dataSources: SourceInfo[] = []

  public get dataSources() {
    return this._dataSources;
  }

  private onInit() {
    for(let i: number = 0; i < this.dataProviders.length; i += 1) {
      let sourceInfo = this.dataProviders[i].getInfo();
      sourceInfo.index = i;
      this._dataSources.push(sourceInfo);
    }
  }

  public setPollingOrder(sources: SourceInfo[]): boolean {
    if(!this.verifySourcesUpdate(sources))
      return false;
    for(let i = 0; i < sources.length; i += 1)
      this._dataSources[i].index = sources[i].index;
    return true;
  }

  private verifySourcesUpdate(sources: SourceInfo[]): boolean {
    if(this._dataSources.length !== sources.length)
      return false;
    for(let i = 0; i < sources.length; i += 1) {
      if(
        this._dataSources[i].name !== sources[i].name ||
        this._dataSources[i].url !== sources[i].url
      )
        return false;
    }
    return true;
  }

  public polling(intervalValue: number): Observable<Currencies | null | string> {
    return new Observable<Currencies | null | string>(subscriber => {
      let intervalSubscription = interval(intervalValue).subscribe({
        next: () => {
          subscriber.next('update');
          this.getData().subscribe(
            (data) => {
              subscriber.next(data);
            }
          );
        }
      });
      return function unsubscribe() {
        intervalSubscription.unsubscribe();
      };
    })
  }

  public getData(): Observable<Currencies | null> {
    // this.cbrXmlService.getData().subscribe(result => {console.log(result)});
    // return onErrorResumeNext(...this.dataProviders.map(dataProviderService => dataProviderService.getData())).pipe(
    return onErrorResumeNext(...this._dataSources.map(
      dataSource => this.dataProviders[dataSource.index].getData())
    ).pipe(
      first(),
      catchError(err => {
        console.error(err);
        return of(null);
      })
    );
  }

}
