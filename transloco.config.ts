import {TranslocoGlobalConfig} from '@jsverse/transloco-utils';

const config: TranslocoGlobalConfig = {
  rootTranslationsPath: 'src/assets/i18n/',
  langs: [ 'pl', 'en' ],
  defaultLang: 'pl',
  keysManager: {}
};

export default config;
