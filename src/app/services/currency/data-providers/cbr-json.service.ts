import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";

import { CurrencyInterface } from "../../../interfaces/currency/currency-interface";
import { QuotesInterface } from "../../../interfaces/currency/quotes-interface";

import { AbstractCurrencyDataProvider } from "./abstract-currency-data-provider";

interface CurrencyObjectInterface {
  [currencyCode: string]: {
    readonly ID: string
    readonly NumCode: number
    readonly CharCode: string
    readonly Nominal: number
    readonly Name: string
    readonly Value: number
    readonly Previous: number
  }
}

interface InputDataInterface {
  Date: string
  PreviousDate: string
  PreviousURL: string
  Timestamp: string
  Valute: CurrencyObjectInterface[]
}

@Injectable({
  providedIn: 'root'
})
export class CbrJsonService extends AbstractCurrencyDataProvider<InputDataInterface> {

  constructor(protected http: HttpClient) { super(); }

  protected readonly sourceUrl: string = "https://www.cbr-xml-daily.ru/daily_json.js";
  protected readonly sourceName: string = "CBR-DAILY-JSON";

  public getData(): Observable<QuotesInterface> {
    return this.getAndFormatData();
  }

  protected formatData(data: InputDataInterface): QuotesInterface {
    let quotes: {[currencyCode: string]: CurrencyInterface} = {};
    for (const key in data.Valute) {
      Object.assign(quotes, {
        [key]: {
          charCode: data.Valute[key]['CharCode'],
          name: data.Valute[key]['Name'],
          nominal: data.Valute[key]['Nominal'],
          value: data.Valute[key]['Value'],
          previousValue: data.Valute[key]['Previous'],
        }
      });
    }
    return {
      sourceUrl: this.sourceUrl,
      sourceName: this.sourceName,
      timestamp: Date.parse(data.Date),
      previousTimestamp: Date.parse(data.PreviousDate),
      base: 'RUB',
      quotes: quotes
    };
  }
}
