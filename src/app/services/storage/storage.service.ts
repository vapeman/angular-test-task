import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  public setItem(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    }
    catch (err) {
      console.error('StorageService', 'setItem', err);
      return false;
    }
    return true;
  }

  public getItem(key: string): any {
    const item: string | null = localStorage.getItem(key);
    if(item === null)
      return null;
    let res: any
    try {
      res = JSON.parse(item);
    }
    catch (err) {
      console.error('StorageService', 'getItem', err);
      return null;
    }
    return res;
  }

  public isItemExists(key: string): boolean {
    const item: string | null = localStorage.getItem(key);
    return item !== null;
  }
}
