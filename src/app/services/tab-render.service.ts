import {Injectable} from "@angular/core";
import {Bar} from "../types/bar.type";
import {BarItem} from "../types/bar-item.type";
import {TabObjectType} from "../enums/tab-object-type.enum";
import {TabInterface} from "../configs/tab-interface.config";
import {Row} from "../types/row.type";
import {TimeSignature} from "../types/time-signature.type";
import {GetColumnItemWidthFunction} from "../functions/get-column-item-width.function";
import {NoteEnum} from "../enums/note.enum";
import {GetNoteWidth} from "../functions/get-note-width.function";


@Injectable({providedIn: "root"})
export class TabRenderService {
  public recalculateBarItemsPositions(tabulation: Row[]) {
    tabulation.forEach((row: Row) => {
      row.bars.forEach((bar: Bar, barIndex: number) => {
        bar.items.map((column: BarItem[], columnIndex: number) => {
          return column.map((item: BarItem) => {
            item.x = this.calculatePositionX(item?.note?.type ?? NoteEnum.QUARTER_NOTE, bar.timeSignature, barIndex, columnIndex, bar);
          })
        })
      })
    })

    return tabulation;
  }

  public generateBar(x: number, y: number, v: number, h: number) {
    let barString: string = "";
    for (let i = 0; i < TabInterface.NUMBER_OF_LINES; i++){
      barString += this.generateTabLine(x, y + (i* TabInterface.SPACE_BETWEEN_LINES), x + h);
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

    return barWidth + TabInterface.PADDING;
  }

  public renderRowPath(bars: Bar[]){
    let tabulationPath: string[] = [];
    let rowWidth = 0;
    bars.forEach((bar: Bar, index) => {
      const barWidth = this.calculateLengthOfBar(bar);
      rowWidth += barWidth;
      const x: number = index * barWidth;
      const y: number = TabInterface.SPACE_BETWEEN_LINES;
      const v: number = TabInterface.NUMBER_OF_LINES * TabInterface.SPACE_BETWEEN_LINES;
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

  private calculatePositionX(type: NoteEnum, timeSignature: TimeSignature, barNumber: number, columnIndex: number, bar: Bar): number {
    const barWidth = this.calculateLengthOfBar(bar);
    const itemsBefore = bar.items.slice(0, columnIndex );
    const widthItemsBefore = this.getOneItemPerColumn(itemsBefore).reduce((acc, curr) => {
        return acc + GetColumnItemWidthFunction(curr?.tabObject?.type, curr?.note?.type);
    }, 0);

    return TabInterface.PADDING  + ((barWidth * barNumber) + widthItemsBefore);
  }

  private getOneItemPerColumn(items: BarItem[][]): BarItem[] {
    return items.map((column: BarItem[]) => column.slice(0, 1)).flat(Infinity) as BarItem[]
  }
}
