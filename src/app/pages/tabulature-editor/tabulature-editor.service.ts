import {inject, Injectable, signal} from "@angular/core";
import {TimeSignature} from "../../types/time-signature.type";
import {HighlightService} from "../../services/highlight.service";
import {TabulatureService} from "../../services/tabulature.service";
import {HighlightPosition} from "../../types/highlight-position.type";
import {Row} from "../../types/row.type";


@Injectable({providedIn: 'root'})
export class TabulatureEditorService {

    highlightService = inject(HighlightService);
    tabulatureService = inject(TabulatureService);
    timeSignatureDialogVisible = signal<boolean>(false);

    public get highlight$(): HighlightPosition | null{
      return this.tabulatureService.highlight$;
    }

    get tabulation$(): Row[] {
        return this.tabulatureService.tabulation();
    }

  setTimeSignature(timeSignature: TimeSignature) {
    const newTabulation = this.tabulation$;
    console.log('Before setting time signature:', {
      highlight: this.highlight$,
      tabulation: newTabulation,
    });

    if (!!this.highlight$) {
      const {rowNumber, barNumber} = this.highlight$;
      const newRow = newTabulation[rowNumber];
      newRow.bars[barNumber].timeSignature = timeSignature;
      this.tabulatureService.updateTabulation(newTabulation);

      console.log('Updated tabulation:', newTabulation);
    }
  }
}
