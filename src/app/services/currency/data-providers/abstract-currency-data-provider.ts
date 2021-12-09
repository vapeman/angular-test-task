import { CurrencyDataProviderInterface } from "../../../interfaces/currency/currency-data-provider-interface";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { QuotesInterface } from "../../../interfaces/currency/quotes-interface";
import { CurrencySourceMetadataInterface } from "../../../interfaces/currency/currency-source-metadata-interface";

export abstract class AbstractCurrencyDataProvider<InputDataT> implements CurrencyDataProviderInterface {
  protected abstract http: HttpClient
  protected abstract readonly sourceUrl: string
  protected abstract readonly sourceName: string
  protected getAndFormatData(): Observable<QuotesInterface> {
    return new Observable<QuotesInterface>(subscriber => {
      this.http.get<InputDataT>(this.sourceUrl).subscribe({
        next: (data: InputDataT) => {subscriber.next(this.formatData(data))},
        error: (msg) => {subscriber.error(msg);}
      });
    });
  }
  protected abstract formatData(data: InputDataT): QuotesInterface
  public abstract getData(): Observable<QuotesInterface>
  public getInfo(): CurrencySourceMetadataInterface {
    return {name: this.sourceName, url: this.sourceUrl, index: 0};
  }
}
