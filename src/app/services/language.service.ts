import {inject, Injectable} from "@angular/core";
import {TranslocoService} from "@jsverse/transloco";
import {StorageService} from "./storage.service";
import {Language} from "../enums/language.enum";


@Injectable({providedIn: 'root'})
export class LanguageService {
  translocoService = inject(TranslocoService);

  storageService = inject(StorageService);

  public initLanguage() {
    const language: string = this.getInitLanguage();
    this.updateLanguage(language);
  }

  public updateLanguage(language: string): void {
    this.translocoService.setActiveLang(language);
    this.storageService.saveLanguage(language);
    this.setLangInHtmlTag(language);
  }

  private getInitLanguage() {
    const language: string | null = this.storageService.getLanguage();
    if (language)  return language;

    const browserLanguage: string | null = this.getBrowserLanguage();
    if (browserLanguage)  return browserLanguage;

    return Language.PL;
  }

  private getBrowserLanguage() {
    const metaLanguage: string | null | undefined = document.querySelector('html')?.getAttribute('lang');
    if (metaLanguage)  return metaLanguage;

    return null;
  }

  private setLangInHtmlTag(lang: string): void {
     document.querySelector('html')?.setAttribute('lang', lang);
  }
}
