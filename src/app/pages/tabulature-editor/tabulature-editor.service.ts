import {inject, Injectable, signal} from "@angular/core";
import {TimeSignature} from "../../types/time-signature.type";
import {HighlightService} from "../../services/highlight.service";
import {TabulatureService} from "../../services/tabulature.service";
import {HighlightPosition} from "../../types/highlight-position.type";
import {Row} from "../../types/row.type";
import {StorageService} from "../../services/storage.service";


@Injectable({providedIn: 'root'})
export class TabulatureEditorService {

    tabulatureService = inject(TabulatureService);
    storageService = inject(StorageService);

    public get highlight$(): HighlightPosition | null{
      return this.tabulatureService.highlight$;
    }

    get tabulation$(): Row[] {
        return this.tabulatureService.tabulation();
    }

    saveTabulature(tabulation: Row[]) {
      this.storageService.saveTabulature(tabulation);
    }

    getTabulature(): Row[] | null {
      return this.storageService.getTabulature();
    }



}
