import {inject, Injectable} from "@angular/core";
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
import {TimeSignatureRenderService} from "./time-signature-render.service";
import {CalculatePositionX} from "../functions/calculate-position-x.function";
import {DeepCopy} from "../functions/deep-copy.function";
import {FindBarPosition} from "../functions/find-bar-position.function";
import {ExtractBarsToPosition} from "../functions/extract-bars-to-position.function";
import {PauseRenderService} from "./pause-render.service";


@Injectable({providedIn: "root"})
export class TabRenderService {

  timeSignatureRenderService: TimeSignatureRenderService = inject(TimeSignatureRenderService);
  pauseRenderService: PauseRenderService = inject(PauseRenderService);


  public recalculateBarItemsPositions(tabulation: Row[]) {
    return tabulation.map(row => {
      return {
        ...row,
        bars: row.bars.map((bar, barIndex) => {
          const previousBarsWidth = this.previousBarsWidth(barIndex, row.bars);
          return {
            ...bar,
            items: this.insertTimeSignature(bar.items, tabulation, this.timeSignatureRenderService.timeSignatureHasChanged(barIndex, row.bars, bar.timeSignature, tabulation)).map((column, columnIndex) => {
              return column.map(item => ({
                ...item,
                x: CalculatePositionX(previousBarsWidth, columnIndex, bar),
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
        widthToAdd = GetColumnItemWidthFunction(item?.tabObject?.type, item?.note?.type);
      })
      barWidth += widthToAdd;
    })

    return barWidth + TabInterface.PADDING;
  }

  public renderRowPath(bars: Bar[], tabulation: Row[]){
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

      additionalItems.push(...this.renderAdditionalItems(bar, index, bars, beforeBarsWidth, tabulation));
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

  private renderAdditionalItems(bar: Bar, index: number, bars: Bar[], previousBarsWidth: number, tabulation: Row[]) {
    const elementsForBar: RenderableItem[] = [];

    if (bar.timeSignature) {
      const timeSignatureElement = this.timeSignatureRenderService.renderTimeSignature(bar, index, bars, bar.timeSignature, previousBarsWidth, tabulation);
      timeSignatureElement && elementsForBar.push(...timeSignatureElement);
    }

    const pauseElements: RenderableItem[] = this.pauseRenderService.renderPauseElements(bar, index, bars, previousBarsWidth);
    pauseElements && elementsForBar.push(...pauseElements);


    return elementsForBar;
  }

  private generateTabLine(x: number, y: number, h: number): string {
    return `M ${x} ${y} H ${h}`;
  }

  private generateBarLine(x: number, y: number, v: number): string {
    return `M ${x} ${y} V ${v}`;
  }


  public previousBarsWidth(index: number, bars: Bar[]) {
    const barsBeforeCurrent = bars.slice(0, index);
    return barsBeforeCurrent.reduce((acc, curr) => {
      return acc + this.calculateLengthOfBar(curr);
    }, 0)
  }

  private insertTimeSignature(barItems: BarItem[][], tabulation: Row[], timeSignatureChanged: boolean) {
    if (!timeSignatureChanged) {
      return barItems;
    }

    if (this.timeSignatureAlreadyAdded(barItems, tabulation)) {
      return barItems;
    }

    const firstBar: BarItem[] = DeepCopy(barItems[0]).map(barItem => ({
      ...barItem,
      tabObject: {
        type: TabObjectType.TimeSignature,
      }
    }));

    barItems.unshift(firstBar);

    return barItems;
  }

  private timeSignatureAlreadyAdded(barItems: BarItem[][], tabulation: Row[]) {
    const {rowIndex, barIndex} = FindBarPosition(tabulation, barItems);
    const bar = tabulation[rowIndex].bars[barIndex];

    return bar.items.some((barItem: BarItem[]) => barItem[0]?.tabObject?.type === TabObjectType.TimeSignature);
  }

}
