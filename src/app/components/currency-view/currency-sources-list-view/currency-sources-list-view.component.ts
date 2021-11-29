import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {SourceInfo} from "../../../services/currency/currency.service";

@Component({
  selector: 'app-currency-sources-list-view',
  templateUrl: './currency-sources-list-view.component.html',
  styleUrls: ['./currency-sources-list-view.component.less'],
})
export class CurrencySourcesListViewComponent implements OnInit {

  constructor() { }

  @Input() sources: SourceInfo[] = []
  @Output() closeEvent = new EventEmitter<void>();

  ngOnInit(): void {
  }

  public onCloseButtonClicked() {
    this.closeEvent.emit();
  }

}
