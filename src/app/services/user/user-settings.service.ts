import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

import { StorageService } from "../storage/storage.service";
import { CurrencyService, SourceInfo } from "../currency/currency.service";

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {

  constructor(
    private storageService: StorageService,
    private currencyService: CurrencyService
  ) { console.log('UserSettingsService is alive!', this.defaultCurrenciesOrder); }

  private readonly currenciesOrderKey: string = 'USER__SETTINGS__CURRENCIES_ORDER';
  private readonly pollingStateKey: string = 'USER__SETTINGS__POLLING_STATE';

  private readonly defaultCurrenciesOrder: SourceInfo[] = this.currencyService.dataSources;
  private readonly defaultPollingState: boolean = true;

  public getCurrenciesOrder(): Observable<SourceInfo[] | null> {
    return new Observable<SourceInfo[]>(subscriber => {
      const res = this.storageService.getItem(this.currenciesOrderKey);
      if(res === null)
        subscriber.next(this.defaultCurrenciesOrder);
      else
        subscriber.next(res);
    });
  }

  public setCurrenciesOrder(data: SourceInfo[]): Observable<boolean> {
    return new Observable<boolean>(subscriber => {
      if(this.currencyService.setPollingOrder(data))
        subscriber.next(this.storageService.setItem(this.currenciesOrderKey, data));
      else
        subscriber.next(false);
    });
  }

  public getCurrencyPollingState(): Observable<boolean> {
    return new Observable<boolean>(subscriber => {
      const res = this.storageService.getItem(this.pollingStateKey);
      if(res === null)
        subscriber.next(this.defaultPollingState);
      else
        subscriber.next(res);
    });
  }

  public setCurrencyPollingState(data: boolean): Observable<boolean> {
    return new Observable<boolean>(subscriber => {
      subscriber.next(this.storageService.setItem(this.pollingStateKey, data));
    });
  }
}
