import { CurrencyDataProviderInterface } from "../../../interfaces/currency/currency-data-provider-interface";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { QuotesInterface } from "../../../interfaces/currency/quotes-interface";
import { CurrencySourceMetadataInterface } from "../../../interfaces/currency/currency-source-metadata-interface";

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
