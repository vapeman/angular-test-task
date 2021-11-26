import { Component, Input, OnInit } from '@angular/core';

import { CurrencyService, Currencies, Currency } from "../../services/currency/currency.service";

@Component({
  selector: 'app-currency-view',
  templateUrl: './currency-view.component.html',
  styleUrls: ['./currency-view.component.less']
})
export class CurrencyViewComponent implements OnInit {

  constructor(private currencyService: CurrencyService) { }

  @Input() currencyCharCode: string = 'EUR'

  public updating: boolean = false
  public error: boolean = false
  public currencyName: string = ''
  public currencyValue: number | null = null
  public currencyPreviousValue: number | null = null
  public currencyValueIsGrowing: boolean | null | undefined = undefined; /* true -- growing, false -- falling,
                                                                            null -- same, undefined -- unknown */
  public currencyPreviousValueTitle: string = ''
  public currencyTimestamp: number = 0
  public message: string = 'Обновление курса...'

  private data: Currencies | undefined = undefined


  ngOnInit(): void {
    this.getCurrency();
    this.startPolling();
  }

  private startPolling() {
    this.currencyService.polling(10000).subscribe({
      next: (data) => {this.onDataUpdated(data);}
    });
  }

  private getCurrency() {
    this.currencyService.getData().subscribe({
      next: (data) => {this.onDataUpdated(data);}
    });
  }

  private onDataUpdated(data: Currencies | null) {
    if(data === null) {
      this.error = true;
      this.message = 'Не удалось загрузить данные ни из одного источника';
      return;
    }
    this.data = data;
    const currency = this.extractCurrency(this.currencyCharCode);
    if(currency === null) {
      this.error = true;
      this.message = 'Валюта с буквенным кодом "' + this.currencyCharCode + '" отсутствует в загруженных данных';
      return ;
    }
    if(currency.previousValue === null)
      if(this.currencyValue !== null)
        this.currencyPreviousValue = this.currencyValue;
    this.currencyValue = currency.value;
    if(currency.previousValue !== null)
      this.currencyPreviousValue = currency.previousValue;
    this.currencyName = currency.name;
    this.currencyTimestamp = data.timestamp;
    this.updateCurrencyValueChanging();
    this.message = 'Обновление котировок: ' + new Date(this.currencyTimestamp).toLocaleString();
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
