import {TimeSignatureService} from "./time-signature.service";
import {Dialog} from "primeng/dialog";
import {TimeSignature} from "../../../../types/time-signature.type";
import {TranslocoPipe} from "@jsverse/transloco";
import {Button} from "primeng/button";
import {InputNumber} from "primeng/inputnumber";
import {FormsModule} from "@angular/forms";
import {Component, inject} from "@angular/core";

@Component({
  selector: 'app-time-signature-dialog',
  imports: [
    Dialog,
    TranslocoPipe,
    Button,
    InputNumber,
    FormsModule
  ],
  templateUrl: './time-signature-dialog.component.html',
  styleUrl: './time-signature-dialog.component.scss',
  standalone: true,
})
export class TimeSignatureDialogComponent {
    timeSignatureService = inject(TimeSignatureService);

    get visible(): boolean {
        return this.timeSignatureService.visible();
    }

    set visible(visible: boolean) {
        this.timeSignatureService.visible.set(visible);
    }

    get timeSignature(): TimeSignature  {
        return this.timeSignatureService.timeSignature();
    }

    constructor() {

    }

    handleIncreaseTimeSignatureNumerator() {
        this.timeSignatureService.updateTimeSignatureNumerator(this.timeSignature.numerator + 1);
    }

    handleDecreaseTimeSignatureNumerator() {
        this.timeSignatureService.updateTimeSignatureNumerator(this.timeSignature.numerator - 1);
    }

    handleIncreaseTimeSignatureDenominator() {
     this.timeSignatureService.updateTimeSignatureDenominator(this.timeSignature.denominator * 2);
    }

    handleDecreaseTimeSignatureDenominator() {
      this.timeSignatureService.updateTimeSignatureDenominator(this.timeSignature.denominator / 2);
    }

    handleCancel() {
        this.visible = false;
    }

    handleSave() {
      this.timeSignatureService.updateTimeSignature();
      this.visible = false;
    }
}
