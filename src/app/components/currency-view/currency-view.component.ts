import { Component, Input, OnInit } from '@angular/core';

import { CurrencyService, Currencies, Currency, SourceInfo } from "../../services/currency/currency.service";
import { Subscription } from "rxjs";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-currency-view',
  templateUrl: './currency-view.component.html',
  styleUrls: ['./currency-view.component.less'],
  animations: [
    trigger('fadeScaleInOutAnimation', [
      transition('void => *', [
        style({opacity: 0, transform: 'scale(.1)'}),
        animate('.3s', style({opacity: 1, transform: 'scale(1)'}))
      ]),
      transition('* => void', [
        animate('.3s', style({opacity: 0, transform: 'scale(.1)'}))
      ]),
    ]),
  ],
})
export class CurrencyViewComponent implements OnInit {

  constructor(private currencyService: CurrencyService) { }

  @Input() currencyCharCode: string = 'EUR'

  public updating: boolean = false
  public error: boolean = false
  public currencyName: string = ''
  public currencyValue: number | null = null
  public currencyPreviousValue: number | null = null
  public currencyNominal: number = 1
  public currencyValueIsGrowing: boolean | null | undefined = undefined; /* true -- growing, false -- falling,
                                                                            null -- same, undefined -- unknown */
  public currencyPreviousValueTitle: string = ''
  public currencyTimestamp: number = 0
  public message: string = ''

  private data: Currencies | undefined = undefined
  public valueUpdatedAt: string = '---'
  public dataUpdatedAt: string = '---'
  public sourceName: string = ''
  public sourceUrl: string = ''

  public showSourceList: boolean = false
  public sourceList: SourceInfo[] = []

  private currencyPollingSubscription: Subscription | null = null
  public currencyPollingIsActive: boolean = false


  ngOnInit(): void {
    this.sourceList = this.currencyService.dataSources;
    this.startPolling();
  }

  public onPollingButtonClicked() {
    if(this.currencyPollingIsActive)
      this.stopPolling();
    else
      this.startPolling();
  }

  public onOpenCurrencySourcesList() {
    this.stopPolling();
    this.showSourceList = true;
  }

  public onCloseCurrencySourcesList() {
    this.showSourceList = false;
  }

  public onApplyNewCurrencySourcesOrder(data: SourceInfo[]) {
    this.showSourceList = false;
    this.stopPolling();
    if(!this.currencyService.setPollingOrder(data))
      console.error('There was an error that shouldn\'t be possible');
    this.startPolling();
  }

  private startPolling() {
    if(this.currencyPollingSubscription !== null)
      return ;
    this.getCurrency();
    this.currencyPollingIsActive = true;
    this.currencyPollingSubscription = this.currencyService.polling(10000).subscribe({
      next: (data) => {
        if(typeof data === 'string') {
          this.updating = true;
          this.message = 'Обновление курса...';
        }
        else
          this.onDataUpdated(data);
      },
    });
  }

  private stopPolling() {
    if(this.currencyPollingSubscription === null)
      return ;
    this.currencyPollingSubscription.unsubscribe();
    this.currencyPollingIsActive = false;
    this.currencyPollingSubscription = null;
    this.currencyTimestamp = 0;
    this.currencyPreviousValue = null;
  }

  private getCurrency() {
    this.updating = true;
    this.message = 'Обновление курса...';
    this.currencyService.getData().subscribe({
      next: (data) => {this.onDataUpdated(data);}
    });
  }

  private onDataUpdated(data: Currencies | null) {
    this.updating = false;
    this.message = '';
    if(data === null) {
      this.error = true;
      this.message = 'Не удалось загрузить данные ни из одного источника';
      return;
    }
    this.data = data;
    const currency = this.extractCurrency(this.currencyCharCode);
    if(currency === null) {
      this.error = true;
      this.message = 'Валюта "' + this.currencyCharCode + '" отсутствует в загруженных данных';
      return ;
    }
    if(currency.previousValue === null) {
      if(this.currencyTimestamp !== 0 && this.currencyTimestamp < data.timestamp)
        this.currencyPreviousValue = this.currencyValue;
      // if (this.currencyValue !== null)
    } else {
      this.currencyPreviousValue = currency.previousValue;
    }
    this.currencyValue = currency.value;
    this.currencyNominal = currency.nominal;
    this.dataUpdatedAt = new Date().toLocaleString();
    this.currencyTimestamp = data.timestamp;
    this.valueUpdatedAt = new Date(this.currencyTimestamp).toLocaleString();
    this.currencyName = currency.name;
    this.sourceName = data.sourceName;
    this.sourceUrl = data.sourceUrl;
    this.updateCurrencyValueChanging();
  }

  private extractCurrency(currencyCharCode: string): Currency | null {
    if(this.data === undefined)
      return null;
    if(!this.data.quotes.hasOwnProperty(currencyCharCode))
      return null;
    return this.data.quotes[currencyCharCode];
  }

  private updateCurrencyValueChanging() {
    if(this.currencyPreviousValue !== null && this.currencyValue !== null) {
      this.currencyValueIsGrowing = this.currencyPreviousValue !== this.currencyValue ?
        this.currencyValue > this.currencyPreviousValue : null;
      this.currencyPreviousValueTitle = 'Предыдущий курс: ' + this.currencyPreviousValue;
    }
    else
      this.currencyValueIsGrowing = undefined;
  }
}
