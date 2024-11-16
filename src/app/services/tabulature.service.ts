import {computed, Injectable, signal} from "@angular/core";
import {HiglightItemPosition} from "../types/higlight-item-position.type";
import {HighlightPosition} from "../types/highlight-position.type";
import {BarItem} from "../types/bar-item.type";
import {TabInterface} from "../configs/tab-interface.config";
import {Regex} from "../configs/regex.config";
import {TimeSignature} from "../types/time-signature.type";
import {TabObjectType} from "../enums/tab-object-type.enum";
import {Position} from "../types/position.type";
import {TabulationRender} from "../types/tabulation-render.type";
import {Bar} from "../types/bar.type";
import {Row} from "../types/row.type";
import {MousePosition} from "../types/mouse-position.type";
import {Note} from "../types/note.type";
import {ArrowKey} from "../types/arrow-key.type";
import {ArrowKeyEnum} from "../enums/arrow-key.enum";
import {ExtendedBarItem} from "../types/extended-bar-item.type";

const INITIAL_HIGHLIGHT_POSITION: HiglightItemPosition = {x: -100, y: 0};
const INITIAL_SPACE_BETWEEN_ITEMS: number = 70;
const INITIAL_GUITAR_TUNING = ["E", "A", "D", "G", "B", "E"];
const INITIAL_TIME_SIGNATURE: TimeSignature = {
  numerator: 4,
  denominator: 4
}
// const INITIAL_BAR: Row[] = [
//   [
//       {
//       id: 1,
//       row: 1,
//       items: [],
//       timeSignature: {
//         numerator: 4,
//         denominator: 4
//       },
//       tempo: 120,
//       repeatStarts: false,
//       repeatEnds: false,
//     }
//   ]
// ];

@Injectable({providedIn: "root"})
export class TabulatureService {
  readonly NUMBER_OF_LINES: number = 6;

  readonly SPACE_BETWEEN_LINES: number = 25;

  spaceBetweenItems = signal<number>(INITIAL_SPACE_BETWEEN_ITEMS);

  timeSignature = signal<TimeSignature>(INITIAL_TIME_SIGNATURE)

  barLinesPositions = signal<Position[]>([]);

  tabLines = signal<string>("");

  barLines = signal<string>("");

  activeGuitarTuning = signal<string[]>(INITIAL_GUITAR_TUNING);

  tabulation = signal<Row[]>([]);

  tabulationPaths = signal<string[]>([])

  highlightedTabulationGridItem = signal<BarItem | null>(null);

  highlight = signal<HighlightPosition | null>(null);

  currentBarNumber = signal<number>(0);

  tabulationRender = signal<TabulationRender>({
    numberOfBars: 2,
    numberOfTabRows: 2,
  });

  fretNumber: string = ""

  public containerWidth = signal<number>(0);

  tabulationLinesWidth = computed<number>(() => {
    return (this.containerWidth() );
  });

  barWidth = computed<number>(() => {
    return (this.spaceBetweenItems() * this.timeSignature().numerator) + this.spaceBetweenItems() / 2;
  })


  highlightedItemPosition = computed<Position>( () => {
    const shiftToCenter: number = (TabInterface.FONT_SIZE + (TabInterface.FONT_SIZE / 2)) / 2;
    return {
      x: (this.highlightedTabulationGridItem()?.x ?? - 100 )- shiftToCenter + ( (this.highlightedTabulationGridItem()?.tabObject?.fretNumber ?? 0) > 9 ? TabInterface.FONT_SIZE / 3 : TabInterface.FONT_SIZE / 4),
      y: (this.highlightedTabulationGridItem()?.y ?? 0)- shiftToCenter
    };
  })

  private generateTabLine(x: number, y: number, h: number): string {
    return `M ${x} ${y} H ${h}`;
  }

  private generateBarLine(x: number, y: number, v: number): string {
    return `M ${x} ${y} V ${v}`;
  }

  private isItemNearMouse(itemX: number, itemY: number, mouseX: number, mouseY: number): boolean {
    const buffer: number = 10;
    return itemX < (mouseX + this.spaceBetweenItems() + buffer)
      && itemX > (mouseX - this.spaceBetweenItems() - buffer)
      && itemY < (mouseY + this.SPACE_BETWEEN_LINES + buffer)
      && itemY > (mouseY - this.SPACE_BETWEEN_LINES - buffer);
  }

  private setHighlightPosition(highlightItem: HighlightPosition) {
    this.highlight.set(highlightItem);
  }

  private isItemValidToInsert(fretNumber: string): boolean {
    return Regex.isNumber.test(fretNumber) && (this.highlightedItemPosition()?.x ?? INITIAL_HIGHLIGHT_POSITION.x) !== INITIAL_HIGHLIGHT_POSITION.x;
  }

  private arrowUpCheck(itemX: number, itemY: number, x: number, y: number): boolean {
    return itemX === x && itemY < y;
  }

  private arrowDownCheck(itemX: number, itemY: number, x: number, y: number): boolean {
    return itemX === x && itemY > y;
  }

  private arrowLeftCheck(itemX: number, itemY: number, x: number, y: number): boolean {
    return itemX < x && itemY === y;
  }

  private arrowRightCheck(itemX: number, itemY: number, x: number, y: number): boolean {
    return itemX > x && itemY === y;
  }

  private sortingByOneAxis(a:number, b:number, axisDistance:number): number {
    return Math.abs(a - axisDistance) - Math.abs(b - axisDistance);
  }

  private isValidTwoDigitFretNumber(fretNumber: number): boolean {
    return fretNumber < 25 && fretNumber > 9;
  }

  // private checkIfAddNextBar() {
  //   const barLinesPositionLength = this.barLinesPositions().length;
  //   const barLastItemPosition: number = this.barLinesPositions()[barLinesPositionLength - 1].x
  //    if (this.highlightedTabulationGridItem()!.x > barLastItemPosition) {
  //      this.numberOfBars.set(this.numberOfBars() + 1);
  //      this.barLines.set(this.generateBarLines());
  //    }
  // }
  private moveHighlight(direction: ArrowKey, currentRow: Row, columnNumber: number, stringNumber: number, rowNumber: number, barNumber: number): HighlightPosition | null {
      let column: number= columnNumber;
      let string: number = stringNumber;
      let bar: Bar | null = currentRow.bars[barNumber] ?? null;
      let barIndex: number = barNumber;
      let row: Row | null = currentRow;
      let rowIndex: number = rowNumber;

      if (direction === ArrowKeyEnum.ArrowLeft || direction === ArrowKeyEnum.ArrowRight) {
        let summand: number = direction === ArrowKeyEnum.ArrowLeft ? -1 : 1;
        column += summand;

        if (column > 3 || column < 0) {
          bar = currentRow.bars[barIndex + summand] ??
            (this.tabulation()[rowNumber + summand]?.
              bars[direction === ArrowKeyEnum.ArrowLeft ? this.tabulation()[rowNumber + summand]?.bars.length - 1 : 0]
              ?? null);
          barIndex = currentRow.bars[barIndex + summand]
            ? barNumber + summand
            : (direction === ArrowKeyEnum.ArrowLeft ? (this.tabulation()[rowNumber + summand]?.bars.length - 1 ?? null) : 0);
          rowIndex = currentRow.bars[barNumber + summand] ? rowNumber : rowNumber + summand;
          column = direction === ArrowKeyEnum.ArrowLeft ? bar?.items?.length - 1 : 0;
        }
      }

      if (direction === ArrowKeyEnum.ArrowUp || direction === ArrowKeyEnum.ArrowDown) {
        let summand: number = direction === ArrowKeyEnum.ArrowUp ? -1 : 1;
        string = stringNumber + summand;
        if (string > 6 || string < 1) {
          string = direction === ArrowKeyEnum.ArrowUp ? 6 : 1;
          row = this.tabulation()[rowNumber + summand] ?? null;
          rowIndex = rowNumber + summand;
        }

        bar = row?.bars[barNumber] ?? null;

        if (bar === null) {
          bar = row?.bars[barNumber - 1];
          barIndex = row?.bars?.length - 1;
          column = row?.bars[barIndex]?.items?.length - 1;
        }
      }
      if (row === null || bar === null) {
        return null;
      }

      if (bar.items[column] === undefined || bar.items[column][string - 1] === undefined) {
        return null;
      }
      const barItem: BarItem = bar.items[column][string - 1];

      return {
        x: barItem.x,
        y: barItem.y,
        rowNumber: rowIndex,
        columnNumber: column,
        stringNumber: string,
        barNumber: barIndex
      }
  }

  private moveHighlightRectangle(direction: ArrowKey) {
    const {x, y, rowNumber, columnNumber, stringNumber, barNumber} = this.highlight()!;

    const currentRow: Row | null = this.tabulation().find((row: Row) => row.id === rowNumber) ?? null;

    if (!currentRow) {
      return;
    }

    let newHighlightPosition: HighlightPosition | null = null;
    switch (direction) {
      case ArrowKeyEnum.ArrowUp:
        newHighlightPosition = this.moveHighlight(ArrowKeyEnum.ArrowUp, currentRow, columnNumber, stringNumber, rowNumber, barNumber);
        this.highlight.set(newHighlightPosition ? newHighlightPosition : this.highlight());
        break;
      case ArrowKeyEnum.ArrowDown:
        newHighlightPosition = this.moveHighlight(ArrowKeyEnum.ArrowDown, currentRow, columnNumber, stringNumber, rowNumber, barNumber);
        this.highlight.set(newHighlightPosition ?? this.highlight());
        break;
      case ArrowKeyEnum.ArrowRight:
        newHighlightPosition = this.moveHighlight(ArrowKeyEnum.ArrowRight, currentRow, columnNumber, stringNumber, rowNumber, barNumber)
        this.highlight.set(newHighlightPosition ?? this.highlight())
        break;
      case ArrowKeyEnum.ArrowLeft:
        newHighlightPosition = this.moveHighlight(ArrowKeyEnum.ArrowLeft, currentRow, columnNumber, stringNumber, rowNumber, barNumber)
        this.highlight.set(newHighlightPosition ?? this.highlight())
        break;
    }
  }

  public generateBar(x: number, y: number, v: number, h: number) {
    let barString: string = "";
    for (let i = 0; i < this.NUMBER_OF_LINES; i++){
      barString += this.generateTabLine(x, y + (i* this.SPACE_BETWEEN_LINES), x + h);
    }
    barString += this.generateBarLine(x + h, y, v);

    return barString;
  }

  private initializeFirstItem(): BarItem {
    return {
      x: TabInterface.PADDING,
      y: this.SPACE_BETWEEN_LINES,
      xIndex: 0,
      tabObject: {
        positionX: 0,
        barNumber: 0,
        type: TabObjectType.TimeSignature,
      }
    }
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

  private recalculateBarItemsPositions(tabulation: Row[]) {
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

  private initializeBarItems(barNumber: number): BarItem[][] {
    let barItems: BarItem[][] = [];
    for (let i = 0; i < 4; i++) {
      barItems[i] = []
      for (let j = 0; j < this.NUMBER_OF_LINES; j++) {
          barItems[i][j] = {
            x: TabInterface.PADDING + (barNumber * (4 * TabInterface.durationFourLength) + (i * TabInterface.durationFourLength)),
            y: this.SPACE_BETWEEN_LINES + (this.SPACE_BETWEEN_LINES * j),
            stringNumber: j + 1,
            xIndex: i,
          }
      }
    }

    return barItems;
  }

  public initializeBars() {
    const {numberOfTabRows, numberOfBars}  = this.tabulationRender();
    const tabulation: Row[] = this.tabulation();
    let currentBar: number = 1;

    if (tabulation.length === 0) {
      for (let i = 0; i < numberOfTabRows; i++) {
        tabulation[i] = {
          id: i,
          bars: [],
          path: ""
        }
        for (let j = 0; j < numberOfBars; j++) {
          tabulation[i].bars.push({
            id: currentBar,
            row: i,
            items: this.initializeBarItems(j),
            timeSignature: {
              numerator: 4,
              denominator: 4
            },
            tempo: 120,
            repeatStarts: false,
            repeatEnds: false
          });
          currentBar++;
        }
      }
    }

    this.tabulation.set(tabulation);
  }

  private getLengthOfNote(denominator: number): number {
    return denominator === 1 ? TabInterface.durationOneLength :
      denominator === 2 ? TabInterface.durationTwoLength :
      denominator === 4 ? TabInterface.durationFourLength :
      denominator === 8 ? TabInterface.durationEightLength :
      denominator === 16 ? TabInterface.durationSixteenLength : TabInterface.durationThirtyTwoLength;
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

  private calculateLengthOfBar(bar: Bar): number {
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

  private renderRowPath(bars: Bar[]){
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


  private adjustingRows(tabulation: Row[]): Row[] {
    let allBars: Bar[] = [];

    tabulation.forEach((row: Row) => {
      allBars = allBars.concat(row.bars);
    })

    let newTabulation: Row[] = [];
    let currentBars: Bar[] = [];
    let currentRowWidth: number = 0;
    let rowId: number = 0;

    allBars.forEach((bar: Bar) => {
      const barWidth = this.calculateLengthOfBar(bar);

      if (currentRowWidth + barWidth > this.containerWidth()) {
          newTabulation.push({
            id: rowId++,
            bars: currentBars,
            path: ''
          })
          currentBars = [bar];
          currentRowWidth = barWidth;
      } else {
        currentBars.push(bar);
        currentRowWidth += barWidth;
      }
    })

    if (currentBars.length > 0) {
      newTabulation.push({
        id: rowId++,
        bars: currentBars,
        path: ''
      });
    }

    newTabulation.forEach(row => {
      const { tabulationPath } = this.renderRowPath(row.bars);
      row.path = tabulationPath;
    });


    return this.recalculateBarItemsPositions(newTabulation);;
  }

  public renderBars() {
    let tabulation: Row[]  = this.adjustingRows(this.tabulation())
    this.tabulation.set(tabulation);
  }

  public findSpotToHighlight(mousePosition: MousePosition, rowNumber: number) {
      const {x, y} = mousePosition;
      let highlightPosition: HighlightPosition | null = null;
      const nearPositions: ExtendedBarItem[] = []

      const row: Row | null = this.tabulation().find((row: Row) => row.id === rowNumber) ?? null;

      row?.bars.forEach((bar: Bar, barIndex: number) => {
        bar.items.forEach((barItem: BarItem[]) => {
          barItem.forEach((item: BarItem) => {
            if (this.isItemNearMouse(item.x, item.y, x, y)) {
              nearPositions.push({...item, barNumber: barIndex});
            }
          })
        })
      })


      if (nearPositions.length === 0) {
        return;
      }

    nearPositions.sort((a: BarItem, b: BarItem) => {
      return (Math.pow((x - a.x), 2) + Math.pow((a.y - y), 2)) - (Math.pow((x - b.x), 2) + Math.pow((b.y - y), 2));
    })

    highlightPosition = {
        x: nearPositions[0].x,
        y: nearPositions[0].y,
        rowNumber,
        stringNumber: nearPositions[0]?.stringNumber ?? 0,
        columnNumber: nearPositions[0]?.xIndex ?? 0,
        barNumber: nearPositions[0]?.barNumber ?? 0,
    }


      this.setHighlightPosition(highlightPosition);
  }


  public highlightNearestItem(direction: ArrowKey) {
    switch (direction) {
      case ArrowKeyEnum.ArrowUp:
          this.moveHighlightRectangle(ArrowKeyEnum.ArrowUp)
        break;
      case ArrowKeyEnum.ArrowRight:
          this.moveHighlightRectangle(ArrowKeyEnum.ArrowRight)
        break;
      case ArrowKeyEnum.ArrowDown:
          this.moveHighlightRectangle(ArrowKeyEnum.ArrowDown)
        break;
      case ArrowKeyEnum.ArrowLeft:
          this.moveHighlightRectangle(ArrowKeyEnum.ArrowLeft)
        break;
      default:

        break;
    }
  }

}
