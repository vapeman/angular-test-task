import { Observable } from "rxjs";
import { QuotesInterface } from "./quotes-interface";
import { CurrencySourceMetadataInterface } from "./currency-source-metadata-interface";

export interface CurrencyDataProviderInterface {
  getData(): Observable<QuotesInterface>
  getInfo(): CurrencySourceMetadataInterface
}
