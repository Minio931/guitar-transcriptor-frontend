import {Injectable} from "@angular/core";
import {Bar} from "../types/bar.type";
import {BarItem} from "../types/bar-item.type";
import {TabObjectType} from "../enums/tab-object-type.enum";
import {TabInterface} from "../configs/tab-interface.config";
import {Row} from "../types/row.type";
import {TimeSignature} from "../types/time-signature.type";


@Injectable({providedIn: "root"})
export class TabRenderService {
  readonly NUMBER_OF_LINES: number = 6;
  readonly SPACE_BETWEEN_LINES: number = 25;

  public recalculateBarItemsPositions(tabulation: Row[]) {
    tabulation.forEach((row: Row) => {
      row.bars.forEach((bar: Bar, barIndex) => {
        bar.items.map((column: BarItem[], columnIndex: number) => {
          return column.map((item: BarItem) => {
            item.x = this.calculatePositionX(item?.note?.type ?? "4", bar.timeSignature, barIndex, columnIndex);
          })
        })
      })
    })

    return tabulation;
  }

  public generateBar(x: number, y: number, v: number, h: number) {
    let barString: string = "";
    for (let i = 0; i < this.NUMBER_OF_LINES; i++){
      barString += this.generateTabLine(x, y + (i* this.SPACE_BETWEEN_LINES), x + h);
    }
    barString += this.generateBarLine(x + h, y, v);

    return barString;
  }

  public calculateLengthOfBar(bar: Bar): number {
    let barWidth = 0;
    bar.items.forEach(barItem => {
      let widthToAdd = 0;
      barItem.forEach(item => {
        widthToAdd = this.getBarColumnWidth(item, bar.timeSignature.denominator)
      })
      barWidth += widthToAdd;
    })
    return barWidth;
  }

  public renderRowPath(bars: Bar[]){
    let tabulationPath: string[] = [];
    let rowWidth = 0;
    bars.forEach((bar: Bar, index) => {
      const barWidth = this.calculateLengthOfBar(bar);
      rowWidth += barWidth;
      const x: number = index * barWidth;
      const y: number = this.SPACE_BETWEEN_LINES;
      const v: number = this.NUMBER_OF_LINES * this.SPACE_BETWEEN_LINES;
      tabulationPath.push(this.generateBar(x, y, v, barWidth));
    })

    return {
      rowWidth,
      tabulationPath: tabulationPath.join(" ")
    }
  }

  private generateTabLine(x: number, y: number, h: number): string {
    return `M ${x} ${y} H ${h}`;
  }

  private generateBarLine(x: number, y: number, v: number): string {
    return `M ${x} ${y} V ${v}`;
  }

  private getBarColumnWidth (barItem: BarItem, denominator: number): number {
    switch (barItem.tabObject?.type) {
      case TabObjectType.TimeSignature:
        return TabInterface.timeSignatureLength;
      case TabObjectType.Note:
        return barItem!.note!.width;
      default:
        return this.getLengthOfNote(denominator);
    }
  }

  private getLengthOfNote(denominator: number): number {
    return denominator === 1 ? TabInterface.durationOneLength :
      denominator === 2 ? TabInterface.durationTwoLength :
        denominator === 4 ? TabInterface.durationFourLength :
          denominator === 8 ? TabInterface.durationEightLength :
            denominator === 16 ? TabInterface.durationSixteenLength : TabInterface.durationThirtyTwoLength;
  }

  private calculatePositionX(type: string, timeSignature: TimeSignature, barNumber: number, columnIndex: number): number {
    let noteLength: number = 0;
    let fitInBar: number = 0;
    const barValue = timeSignature.numerator / timeSignature.denominator;

    switch (type) {
      case "1":
        noteLength = TabInterface.durationOneLength;
        fitInBar = Math.floor(barValue);
        break;
      case "2":
        noteLength = TabInterface.durationOneLength;
        fitInBar = Math.floor(barValue / 0.5);
        break;
      case "4":
        noteLength = TabInterface.durationFourLength;
        fitInBar = Math.floor(barValue / 0.25);
        break;
      case "8":
        noteLength = TabInterface.durationEightLength;
        fitInBar = Math.floor(barValue / 0.125);
        break;
      case "16":
        noteLength = TabInterface.durationSixteenLength;
        fitInBar = Math.floor(barValue / 0.0625);
        break;
      case "32":
        noteLength = TabInterface.durationThirtyTwoLength;
        fitInBar = Math.floor(barValue / 0.03125);
        break;
      default:
        noteLength = TabInterface.durationFourLength;
        fitInBar = Math.floor(barValue / 0.25);
    }

    return TabInterface.PADDING + (barNumber * (fitInBar * noteLength) + (columnIndex * noteLength));
  }
}
