import {Injectable} from "@angular/core";
import {RenderableElements} from "../configs/renderable-elements.config";
import {TimeSignature} from "../types/time-signature.type";
import {RenderableItem} from "../types/renderable-item.type";
import {TabInterface} from "../configs/tab-interface.config";
import {Bar} from "../types/bar.type";
import {CalculatePositionX} from "../functions/calculate-position-x.function";
import {Row} from "../types/row.type";


@Injectable({providedIn: 'root'})
export class TimeSignatureRenderService {

  public renderTimeSignature(bar: Bar, index: number, bars: Bar[], timeSignature: TimeSignature, previousBarsWidth: number, tabulation: Row[]): RenderableItem[] | null {
    if (!this.timeSignatureHasChanged(index, bars, timeSignature, tabulation)) {
      return null;
    }

    const x = CalculatePositionX(previousBarsWidth, index, bar);
    const y = TabInterface.SPACE_BETWEEN_LINES;

    return this.generateTimeSignature(x, y, timeSignature);
  }

  public timeSignatureHasChanged(index: number, bars: Bar[], timeSignature: TimeSignature, tabulation: Row[]): boolean {
    let prevTimeSignature = bars[index - 1]?.timeSignature ?? null;

    if (!prevTimeSignature) {
      const prevRow = tabulation[this.findIndexOfRow(bars[index], tabulation) - 1];
      prevTimeSignature = prevRow?.bars[prevRow.bars.length - 1]?.timeSignature ?? null;
    }

    return prevTimeSignature ?
      prevTimeSignature.numerator !== timeSignature.numerator || prevTimeSignature.denominator !== timeSignature.denominator
      : true;
  }

  private generateTimeSignature(x: number, y: number, timeSignature: TimeSignature): RenderableItem[] {
    const numeratorPath = this.getTimeSignaturePath(timeSignature.numerator);
    const denominatorPath = this.getTimeSignaturePath(timeSignature.denominator);
    const width = TabInterface.timeSignatureLength;
    const height = TabInterface.SPACE_BETWEEN_LINES * 2;
    const y1 = y + height;

    return [{
      tag: 'image',
      attributes: {
        href: numeratorPath,
        x: x - (width / 2),
        y: y + TabInterface.SPACE_BETWEEN_LINES / 4,
        width: width,
        height: height
      }
    }, {
      tag: 'image',
      attributes: {
        href: denominatorPath,
        x: x - (width / 2),
        y: y1 + TabInterface.SPACE_BETWEEN_LINES / 2,
        width: width,
        height: height
      }
    }];
  }


  private getTimeSignaturePath(number: number): string {
    switch (number) {
      case 1:
        return RenderableElements.number1Path;
      case 2:
        return RenderableElements.number2Path;
      case 3:
        return RenderableElements.number3Path;
      case 4:
        return RenderableElements.number4Path;
      case 5:
        return RenderableElements.number5Path;
      case 6:
        return RenderableElements.number6Path;
      case 7:
        return RenderableElements.number7Path;
      case 8:
        return RenderableElements.number8Path;
      case 9:
        return RenderableElements.number9Path;
      case 10:
        return RenderableElements.number10Path;
      case 11:
        return RenderableElements.number11Path;
      case 12:
        return RenderableElements.number12Path;
      default:
        return RenderableElements.number1Path;
    }
  }

  private findIndexOfRow(bar: Bar, tabulation: Row[]) : number {
    return tabulation.findIndex(row => row.bars.includes(bar));
  }

}
