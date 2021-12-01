import { CurrencyInterface } from "./currency-interface";

export interface QuotesInterface {
  sourceUrl: string
  sourceName: string
  timestamp: number
  previousTimestamp: number | null
  base: string
  quotes: {
    [currencyCode: string]: CurrencyInterface
  }
}
