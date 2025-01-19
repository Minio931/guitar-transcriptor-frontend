import {ApplicationConfig, provideExperimentalZonelessChangeDetection, provideZoneChangeDetection, isDevMode} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';
import {definePreset} from "@primeng/themes";
import {MessageService} from "primeng/api";

const customPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fce5ea',
      100: '#f9bdcb',
      200: '#f592a9',
      300: '#f06988',
      400: '#ea4c6f',
      500: '#e63658',
      600: '#d53156',
      700: '#c02c52',
      800: '#ab274f',
      900: '#861f48',
    }
  }
})

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: customPreset,
        options: {
          prefix: 'p',
          darkModeSelector: 'system',
          cssLayer: false
        }
      }
    }), provideHttpClient(),
    provideTransloco({
        config: {
          availableLangs: ['pl', 'en'],
          defaultLang: 'pl',
          reRenderOnLangChange: true,
          prodMode: isDevMode(),
        },
        loader: TranslocoHttpLoader
      })
  ],
};
