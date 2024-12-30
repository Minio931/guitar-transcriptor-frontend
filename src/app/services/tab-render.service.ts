import {Injectable} from "@angular/core";
import {Bar} from "../types/bar.type";
import {BarItem} from "../types/bar-item.type";
import {TabObjectType} from "../enums/tab-object-type.enum";
import {TabInterface} from "../configs/tab-interface.config";
import {Row} from "../types/row.type";
import {GetColumnItemWidthFunction} from "../functions/get-column-item-width.function";
import {TimeSignature} from "../types/time-signature.type";
import {RenderableElements} from "../configs/renderable-elements.config";
import {RenderableItem} from "../types/renderable-item.type";
import {GetOneItemPerColumn} from "../functions/get-one-item-per-column.function";


@Injectable({providedIn: "root"})
export class TabRenderService {
  public recalculateBarItemsPositions(tabulation: Row[]) {
    return tabulation.map(row => {
      return {
        ...row,
        bars: row.bars.map((bar, barIndex) => {
          const previousBarsWidth = this.previousBarsWidth(barIndex, row.bars);
          return {
            ...bar,
            items: bar.items.map((column, columnIndex) => {
              return column.map(item => ({
                ...item,
                x: this.calculatePositionX(previousBarsWidth, columnIndex, bar),
              }));
            }),
          };
        }),
      };
    });
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
    let additionalItems: RenderableItem[] = [];
    let rowWidth = 0;

    bars.forEach((bar: Bar, index) => {
      const currBarWidth = this.calculateLengthOfBar(bar);
      const beforeBarsWidth = this.previousBarsWidth(index , bars);
      rowWidth += currBarWidth;
      const x: number = beforeBarsWidth;
      const y: number = TabInterface.SPACE_BETWEEN_LINES;
      const v: number = TabInterface.NUMBER_OF_LINES * TabInterface.SPACE_BETWEEN_LINES;
      tabulationPath.push(this.generateBar(x, y, v, currBarWidth));

      const barItems = GetOneItemPerColumn(bar.items);

      barItems.forEach(barItem => {
        const x = this.calculatePositionX(beforeBarsWidth, index, bar);
        const y = TabInterface.SPACE_BETWEEN_LINES;
        if (barItem.tabObject?.type === TabObjectType.TimeSignature) {
          additionalItems.push(...this.generateTimeSignature(x, y, bar.timeSignature!));
        }
      })

    })

    return {
      rowWidth,
      additionalItems,
      tabulationPath: tabulationPath.join(" ")
    }
  }

  public calculateBarLeftTopCornerPosition(bar: Bar, bars: Bar[]): {x: number} {
    const previousBarsWidth = this.previousBarsWidth(bars.indexOf(bar), bars);
    return {
      x: previousBarsWidth ,
    }
  }

  private generateTabLine(x: number, y: number, h: number): string {
    return `M ${x} ${y} H ${h}`;
  }

  private generateBarLine(x: number, y: number, v: number): string {
    return `M ${x} ${y} V ${v}`;
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

  private calculatePositionX(previousBarsWidth: number, columnIndex: number, bar: Bar): number {
    const itemsBefore = bar.items.slice(0, columnIndex);

    const widthItemsBefore = GetOneItemPerColumn(itemsBefore).reduce((acc, curr) => {
      const width = GetColumnItemWidthFunction(curr?.tabObject?.type, curr?.note?.type);
      return acc + width;
    }, 0);

    return TabInterface.PADDING + previousBarsWidth + widthItemsBefore;
  }


  private getTimeSignaturePath(number: number) {
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

  public previousBarsWidth(index: number, bars: Bar[]) {
    const barsBeforeCurrent = bars.slice(0, index);
    return barsBeforeCurrent.reduce((acc, curr) => {
      return acc + this.calculateLengthOfBar(curr);
    }, 0)
  }
}
