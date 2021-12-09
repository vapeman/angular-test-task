import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";

import { NgxXml2jsonService } from "ngx-xml2json";

import { CurrencyInterface } from "../../../interfaces/currency/currency-interface";
import { QuotesInterface } from "../../../interfaces/currency/quotes-interface";

import { AbstractCurrencyDataProvider } from "./abstract-currency-data-provider";


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
export class CbrXmlService extends AbstractCurrencyDataProvider<string>{

  constructor(protected http: HttpClient, private xmlParserService: NgxXml2jsonService) { super(); }

  protected readonly sourceUrl: string = "https://www.cbr-xml-daily.ru/daily_utf8.xml";
  protected readonly sourceName: string = "CBR-DAILY-XML";

  public getData(): Observable<QuotesInterface> {
    return this.getAndFormatData();
  }
  private parseData(data: string): Object {
    const parser = new DOMParser();
    const xml = parser.parseFromString(data, 'text/xml');
    return this.xmlParserService.xmlToJson(xml);
  }
  protected formatData(data: string): QuotesInterface {
    const parsedData = this.parseData(data) as InputDataInterface;
    let quotes: {[currencyCode: string]: CurrencyInterface} = {};
    for(const currency of parsedData.ValCurs.Valute) {
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
    const dateParts = parsedData.ValCurs["@attributes"].Date.split('.');
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
