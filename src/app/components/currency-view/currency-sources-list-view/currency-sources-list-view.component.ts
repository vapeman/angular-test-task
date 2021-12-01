import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { CurrencySourceMetadataInterface } from "../../../interfaces/currency/currency-source-metadata-interface";

@Component({
  selector: 'app-currency-sources-list-view',
  templateUrl: './currency-sources-list-view.component.html',
  styleUrls: ['./currency-sources-list-view.component.less'],
})
export class CurrencySourcesListViewComponent implements OnInit {

  constructor() { }

  @Input() set sources(list: CurrencySourceMetadataInterface[]) {
    this._sources = [];
    for(let item of list)
      this._sources.push(Object.assign({}, item));
    this.updateSortedSources();
  }
  @Output() closeEvent = new EventEmitter<void>();
  @Output() applyEvent = new EventEmitter<CurrencySourceMetadataInterface[]>();

  public get sources(): CurrencySourceMetadataInterface[] {
    return this._sources;
  }
  private _sources: CurrencySourceMetadataInterface[] = []

  public sortedSources: CurrencySourceMetadataInterface[] = []

  ngOnInit(): void {
  }

  public onItemMoveUpClicked(index: number) {
    this.swapSources(index, index-1);
  }

  public onItemMoveDownClicked(index: number) {
    this.swapSources(index, index+1);
  }

  public onApplyButtonClicked() {
    this.applyEvent.emit(this._sources);
  }

  private swapSources(firstItemIndex: number, secondItemIndex: number) {
    // let temp = this.sources[firstItemIndex];
    // this._sources[firstItemIndex] = this.sources[secondItemIndex];
    // this._sources[firstItemIndex].index = firstItemIndex;
    // this._sources[secondItemIndex] = temp;
    // this._sources[secondItemIndex].index = secondItemIndex;
    let firstItem = this._sources.find(item => item.index === firstItemIndex);
    let secondItem = this._sources.find(item => item.index === secondItemIndex);
    if(firstItem === undefined || secondItem === undefined)
      return ;
    firstItem.index = secondItemIndex;
    secondItem.index = firstItemIndex;
    this.updateSortedSources();
  }

  private updateSortedSources() {
    this.sortedSources = [...this._sources].sort((a, b) => a.index - b.index);
  }

  public onCloseButtonClicked() {
    this.closeEvent.emit();
  }

}
