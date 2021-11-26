import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";

import { NgxXml2jsonService } from "ngx-xml2json";

import { Currencies, Currency } from "../currency.service";


interface Valute {
  '@attributes' : {
    ID: string
  }
  CharCode: string
  Name: string
  Nominal: string
  NumCode: string
  Value: string
}
interface InputData {
  ValCurs: {
    '@attributes': {
      Date: string,
      name: string
    }
    Valute: Valute[]
  }
}


@Injectable({
  providedIn: 'root'
})
export class CbrXmlService {

  constructor(private http: HttpClient, private xmlParserService: NgxXml2jsonService) { }

  private readonly sourceUrl: string = "https://www.cbr-xml-daily.ru/daily_utf8.xml";

  public getData(): Observable<Currencies> {
    return new Observable<Currencies>(subscriber => {
      this.http.get(this.sourceUrl, {observe: 'body', responseType: 'text'}).subscribe({
        next: (data) => {
          const obj: InputData = this.parseData(data) as InputData;
          const formattedData: Currencies = this.formatData(obj);
          console.log(formattedData);
          subscriber.next(formattedData);
        },
        error: (msg) => {console.error(msg);}
      });
    });
  }
  private parseData(data: string): Object {
    const parser = new DOMParser();
    const xml = parser.parseFromString(data, 'text/xml');
    return this.xmlParserService.xmlToJson(xml);
  }
  private formatData(data: InputData): Currencies {
    let quotes: Currency = {};
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
      timestamp: date.getTime(),
      previousTimestamp: null,
      base: 'RUB',
      quotes: quotes
    };
  }
}
