import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {SourceInfo} from "../../../services/currency/currency.service";

@Component({
  selector: 'app-currency-sources-list-view',
  templateUrl: './currency-sources-list-view.component.html',
  styleUrls: ['./currency-sources-list-view.component.less'],
})
export class CurrencySourcesListViewComponent implements OnInit {

  constructor() { }

  @Input() set sources(list: SourceInfo[]) {
    this.filteredSources = [...list].sort((a: SourceInfo, b: SourceInfo) => {
      return a.index - b.index;
    });
    console.log(list, this.filteredSources);
  }
  @Output() closeEvent = new EventEmitter<void>();


  public get sources(): SourceInfo[] {
    return this.filteredSources;
  }
  private filteredSources: SourceInfo[] = []

  ngOnInit(): void {
    console.log(this.sources);
  }

  public onCloseButtonClicked() {
    this.closeEvent.emit();
  }

}
