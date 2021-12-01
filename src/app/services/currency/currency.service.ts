import { Injectable } from '@angular/core';

import { Observable, onErrorResumeNext, of, interval } from "rxjs";
import { first, catchError } from "rxjs/operators";

import { CbrJsonService } from "./data-providers/cbr-json.service";
import { CbrXmlService } from "./data-providers/cbr-xml.service";

import { QuotesInterface } from "../../interfaces/currency/quotes-interface";
import { CurrencySourceMetadataInterface } from "../../interfaces/currency/currency-source-metadata-interface";
import { CurrencyDataProviderInterface } from "../../interfaces/currency/currency-data-provider-interface";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export abstract class AbstractCurrencyDataProvider implements CurrencyDataProviderInterface {
  protected abstract http: HttpClient
  protected abstract readonly sourceUrl: string
  protected abstract readonly sourceName: string
  protected getAndFormatData<T>(): Observable<QuotesInterface> {
    return new Observable<QuotesInterface>(subscriber => {
      this.http.get<T>(this.sourceUrl).subscribe({
        next: (data: T) => {subscriber.next(this.formatData<T>(data))},
        error: (msg) => {subscriber.error(msg);}
      });
    });
  }
  protected abstract formatData<T>(data: T): QuotesInterface
  public abstract getData(): Observable<QuotesInterface>
  public getInfo(): CurrencySourceMetadataInterface {
    return {name: this.sourceName, url: this.sourceUrl, index: 0};
  }
}

export class CurrencyService {

  constructor(
    private cbrJsonService: CbrJsonService,
    private cbrXmlService: CbrXmlService,
  ) {
    this.onInit();
  }

  private readonly dataProviders: CurrencyDataProviderInterface[] = [
    this.cbrXmlService,
    this.cbrJsonService,
  ]
  private _dataSources: CurrencySourceMetadataInterface[] = []

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

  public setPollingOrder(sources: CurrencySourceMetadataInterface[]): boolean {
    if(!this.verifySourcesUpdate(sources))
      return false;
    for(let i = 0; i < sources.length; i += 1)
      this._dataSources[i].index = sources[i].index;
    return true;
  }

  private verifySourcesUpdate(sources: CurrencySourceMetadataInterface[]): boolean {
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

  public polling(intervalValue: number): Observable<QuotesInterface | null | string> {
    return new Observable<QuotesInterface | null | string>(subscriber => {
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

  public getData(): Observable<QuotesInterface | null> {
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
