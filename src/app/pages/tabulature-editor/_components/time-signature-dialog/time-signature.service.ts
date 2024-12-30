import {ChangeDetectorRef, inject, Injectable, signal} from "@angular/core";
import {TimeSignature} from "../../../../types/time-signature.type";
import {TabulatureService} from "../../../../services/tabulature.service";

const INITIAL_TIME_SIGNATURE: TimeSignature = {
  numerator: 4,
  denominator: 4
};

const MIN_TIME_SIGNATURE_VALUE = 1;
const MAX_TIME_SIGNATURE_VALUE = 64;
const VALID_DENOMINATORS = [2, 4, 8, 16, 32, 64];

@Injectable({providedIn: 'root'})
export class TimeSignatureService {
  tabulatureService = inject(TabulatureService);

  visible = signal<boolean>(false);

  timeSignature = signal<TimeSignature>(INITIAL_TIME_SIGNATURE);

  updateTimeSignatureNumerator(numerator: number) {
    if (numerator < MIN_TIME_SIGNATURE_VALUE || numerator > MAX_TIME_SIGNATURE_VALUE) {
      return;
    }

    this.timeSignature.update((timeSignature: TimeSignature) => ({
      ...timeSignature,
      numerator
    }));
  }

  updateTimeSignatureDenominator(denominator: number) {
    if (!VALID_DENOMINATORS.includes(denominator)) {
      return;
    }

    this.timeSignature.update((timeSignature: TimeSignature) => ({
      ...timeSignature,
      denominator
    }));
  }

  updateTimeSignature() {
    this.tabulatureService.updateTimeSignature(this.timeSignature());
  }

  showDialog() {
    this.visible.set(true);
  }
}
