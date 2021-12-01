import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";

import { CurrencyInterface } from "../../../interfaces/currency/currency-interface";
import { QuotesInterface } from "../../../interfaces/currency/quotes-interface";
import { CurrencySourceMetadataInterface } from "../../../interfaces/currency/currency-source-metadata-interface";


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
export class CbrJsonService {

  constructor(private http: HttpClient) { }

  private readonly sourceUrl: string = "https://www.cbr-xml-daily.ru/daily_json.js";
  private readonly sourceName: string = "CBR-DAILY-JSON";

  public getInfo(): CurrencySourceMetadataInterface {
    return {name: this.sourceName, url: this.sourceUrl, index: 0}
  }

  public getData(): Observable<QuotesInterface> {
    return new Observable<QuotesInterface>(subscriber => {
      this.http.get<InputDataInterface>(this.sourceUrl).subscribe({
        next: (data) => {subscriber.next(this.formatData(data));},
        error: (msg) => {subscriber.error(msg);}
      })
    });
  }

  private formatData(data: InputDataInterface): QuotesInterface {
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
