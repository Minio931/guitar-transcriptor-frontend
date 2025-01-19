import {Injectable} from "@angular/core";
import {Row} from "../types/row.type";

const LANGUAGE_KEY = 'language';

@Injectable({providedIn: 'root'})
export class StorageService {

  getLanguage(): string | null {
    return this.getItem(LANGUAGE_KEY);
  }

  saveLanguage(language: string): void {
    this.setItem(LANGUAGE_KEY, language);
  }

  removeLanguage(): void {
    this.deleteItem(LANGUAGE_KEY);
  }

  getTabulature(): Row[] | null {
    const tabulation = this.getItem('tabulation');
    return tabulation ? JSON.parse(tabulation) : null;
  }

  saveTabulature(tabulation: Row[]): void {
    console.log(tabulation);
    this.setItem('tabulation', JSON.stringify(tabulation));
  }

  removeTabulature(tabulation: Row[]): void {
    this.deleteItem('tabulation');
  }


  private getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  private deleteItem(key: string) {
    localStorage.removeItem(key);
  }

  private setItem(key: string, value: any): void {
    localStorage.setItem(key, value);
  }
}
