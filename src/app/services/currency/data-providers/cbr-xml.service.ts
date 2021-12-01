import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";

import { NgxXml2jsonService } from "ngx-xml2json";

import { CurrencyInterface } from "../../../interfaces/currency/currency-interface";
import { QuotesInterface } from "../../../interfaces/currency/quotes-interface";
import { CurrencySourceMetadataInterface } from "../../../interfaces/currency/currency-source-metadata-interface";


interface ValuteInterface {
  '@attributes' : {
    ID: string
  }
  CharCode: string
  Name: string
  Nominal: string
  NumCode: string
  Value: string
}
interface InputDataInterface {
  ValCurs: {
    '@attributes': {
      Date: string,
      name: string
    }
    Valute: ValuteInterface[]
  }
}


@Injectable({
  providedIn: 'root'
})
export class CbrXmlService {

  constructor(private http: HttpClient, private xmlParserService: NgxXml2jsonService) { }

  private readonly sourceUrl: string = "https://www.cbr-xml-daily.ru/daily_utf8.xml";
  private readonly sourceName: string = "CBR-DAILY-XML";

  public getInfo(): CurrencySourceMetadataInterface {
    return {name: this.sourceName, url: this.sourceUrl, index: 0}
  }

  public getData(): Observable<QuotesInterface> {
    return new Observable<QuotesInterface>(subscriber => {
      this.http.get(this.sourceUrl, {observe: 'body', responseType: 'text'}).subscribe({
        next: (data) => {
          const obj: InputDataInterface = this.parseData(data) as InputDataInterface;
          const formattedData: QuotesInterface = this.formatData(obj);
          subscriber.next(formattedData);
        },
        error: (msg) => {subscriber.error(msg);}
      });
    });
  }
  private parseData(data: string): Object {
    const parser = new DOMParser();
    const xml = parser.parseFromString(data, 'text/xml');
    return this.xmlParserService.xmlToJson(xml);
  }
  private formatData(data: InputDataInterface): QuotesInterface {
    let quotes: {[currencyCode: string]: CurrencyInterface} = {};
    for(const currency of data.ValCurs.Valute) {
      Object.assign(quotes, {
        [currency.CharCode]: {
          charCode: currency.CharCode,
          name: currency.Name,
          nominal: parseInt(currency.Nominal),
          value: parseFloat(currency.Value.replace(',', '.')),
          previousValue: null,
        }
      });
    }
    const dateParts = data.ValCurs["@attributes"].Date.split('.');
    const date = new Date(parseInt(dateParts[2], 10),
                   parseInt(dateParts[1], 10) - 1,
                          parseInt(dateParts[0], 10));
    return {
      sourceUrl: this.sourceUrl,
      sourceName: this.sourceName,
      timestamp: date.getTime(),
      previousTimestamp: null,
      base: 'RUB',
      quotes: quotes
    };
  }
}
