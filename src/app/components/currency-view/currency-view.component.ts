import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-currency-view',
  templateUrl: './currency-view.component.html',
  styleUrls: ['./currency-view.component.less']
})
export class CurrencyViewComponent implements OnInit {

  constructor() { }

  @Input() currencyCharCode: string = 'EUR'

  public updating: boolean = false
  public error: boolean = false
  public currencyName: string = 'Евро'
  public currencyValue: number = 83.6793
  public currencyPreviousValue: number | null = null
  public currencyValueIsGrowing: boolean | null | undefined = undefined; /* true -- growing, false -- falling,
                                                                            null -- same, undefined -- unknown */
  public currencyDateTime: string = ''
  public message: string = 'Обновление курса...'

  private data: any = undefined


  ngOnInit(): void {}

}
