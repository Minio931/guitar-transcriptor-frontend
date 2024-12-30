import {Injectable} from "@angular/core";

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
