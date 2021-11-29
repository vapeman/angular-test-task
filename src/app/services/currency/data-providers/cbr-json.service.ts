import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";

import { Currencies, Currency, SourceInfo } from "../currency.service";


interface QuoteObject {
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

interface InputData {
  Date: string
  PreviousDate: string
  PreviousURL: string
  Timestamp: string
  Valute: QuoteObject[]
}

@Injectable({
  providedIn: 'root'
})
export class CbrJsonService {

  constructor(private http: HttpClient) { }

  private readonly sourceUrl: string = "https://www.cbr-xml-daily.ru/daily_json.js";
  private readonly sourceName: string = "CBR-DAILY-JSON";

  public getInfo(): SourceInfo {
    return {name: this.sourceName, url: this.sourceUrl}
  }

  public getData(): Observable<Currencies> {
    return new Observable<Currencies>(subscriber => {
      this.http.get<InputData>(this.sourceUrl).subscribe({
        next: (data) => {subscriber.next(this.formatData(data));},
        error: (msg) => {subscriber.error(msg);}
      })
    });
  }

  private formatData(data: InputData): Currencies {
    let quotes: {[currencyCode: string]: Currency} = {};
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
