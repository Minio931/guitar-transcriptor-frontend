import {inject, Injectable, Injector, Signal, signal} from "@angular/core";
import {HighlightPosition} from "../types/highlight-position.type";
import {Row} from "../types/row.type";
import {MousePosition} from "../types/mouse-position.type";
import {Bar} from "../types/bar.type";
import {BarItem} from "../types/bar-item.type";
import {ArrowKey} from "../types/arrow-key.type";
import {ArrowKeyEnum} from "../enums/arrow-key.enum";
import {TabulatureService} from "./tabulature.service";
import {CalculateBarValue} from "../functions/calculate-bar-value.function";
import {TimeSignature} from "../types/time-signature.type";
import {DeepCopy} from "../functions/deep-copy.function";



@Injectable({providedIn: 'root'})
export class HighlightService {

  injector = inject(Injector);

  tabulatureService: TabulatureService | null = null;

  constructor() {
    setTimeout(() => {
      this.tabulatureService = this.injector.get(TabulatureService);
    })
  }

  private _highlight = signal<HighlightPosition | null>(null);

  get highlight(): HighlightPosition | null {
    return this._highlight();
  }

  public setHighlightPosition(position: HighlightPosition | null): void {
    this._highlight.set(position);
  }

  public findNearestHighlight(mousePosition: MousePosition, row: Row, spaceBetweenItems: number, spaceBetweenLines: number): HighlightPosition | null {
    const {x, y} = mousePosition;
    const buffer = 10;
    const nearItems = row.bars.flatMap((bar: Bar, barIndex: number) =>
      bar.items.flatMap((column: BarItem[], columnIndex: number) =>
        column.filter((item: BarItem) =>  this.isItemNearMouse(item.x, item.y, x, y, spaceBetweenItems, spaceBetweenLines, buffer))
          .map((item) => ({
            ...item,
            barNumber: barIndex,
            columnNumber: columnIndex,
          }))
    ))

    if (nearItems.length === 0) {
      return  null;
    }

    const closestItem = nearItems.reduce((closest, item) => {
      const currentDistance = Math.pow(x - item.x, 2) + Math.pow(y - item.y, 2);
      const closestDistance =
        Math.pow(x - closest.x, 2) + Math.pow(y - closest.y, 2);
      return currentDistance < closestDistance ? item : closest;
    });

    return {
      x: closestItem.x,
      y: closestItem.y,
      rowNumber: row.id,
      stringNumber: closestItem.stringNumber ?? 0,
      columnNumber: closestItem.columnNumber ?? 0,
      barNumber: closestItem.barNumber ?? 0,
    }
  }

  public moveHighlight(direction: ArrowKey, tabulation: Row[], currentHighlight: HighlightPosition): HighlightPosition | null {
    const { rowNumber, columnNumber, stringNumber, barNumber} = currentHighlight;
    const currentRow: Row | null = tabulation.find((row: Row) => row.id === rowNumber) ?? null;

    if (!currentRow) {
      return null;
    }

    let newHighlight: HighlightPosition | null = null;

    switch (direction) {
      case ArrowKeyEnum.ArrowLeft:
      case ArrowKeyEnum.ArrowRight:
        newHighlight = this.moveHorizontal(direction, currentRow, stringNumber, columnNumber, rowNumber, barNumber, tabulation);
        break;
      case ArrowKeyEnum.ArrowDown:
      case ArrowKeyEnum.ArrowUp:
        newHighlight = this.moveVertical(direction, currentRow, stringNumber, columnNumber, rowNumber, barNumber, tabulation);
        break;
    }

    return newHighlight;
  }

  private isItemNearMouse(itemX: number, itemY: number, mouseX: number, mouseY: number, spaceBetweenItems: number, spaceBetweenLines: number, buffer: number): boolean {
    return (
      itemX < mouseX + spaceBetweenItems + buffer &&
      itemX > mouseX - spaceBetweenItems - buffer &&
      itemY < mouseY + spaceBetweenLines + buffer &&
      itemY > mouseY - spaceBetweenLines - buffer
    );
  }

  private moveHorizontal(direction: ArrowKey, currentRow: Row, stringNumber: number, columnNumber: number, rowNumber: number, barNumber: number, tabulation: Row[]): HighlightPosition | null {
    let column: number = columnNumber;
    let barIndex: number = barNumber;
    let rowIndex: number = rowNumber;
    const summand = direction === ArrowKeyEnum.ArrowLeft ? -1 : 1;
    let bar: Bar | null = currentRow.bars[barNumber] ?? null;

    if (direction === ArrowKeyEnum.ArrowRight && columnNumber === currentRow.bars[barNumber]?.items?.length - 1) {

      if (bar) {
        const mergedBar = this.mergeDividedBars(tabulation, currentRow, rowNumber, barNumber);
        const barValue = CalculateBarValue(mergedBar ?? bar);
        const timeSignature: TimeSignature = bar.timeSignature
        const difference = barValue - (timeSignature.numerator / timeSignature.denominator);
        if (difference < 0) {
          this.tabulatureService?.createNewColumn(rowNumber, barNumber, columnNumber + 1, bar.items[columnNumber][stringNumber - 1]);
        }
      }
    }

    column += summand;

    if (column < 0 || column >= currentRow.bars[barIndex]?.items?.length) {
      bar = currentRow.bars[barIndex + summand] ??
        (tabulation[rowIndex + summand]?.bars[direction === ArrowKeyEnum.ArrowLeft ? tabulation[rowNumber + summand]?.bars.length - 1 : 0] ?? null);

      barIndex = currentRow.bars[barIndex + summand]
        ? barNumber + summand
        : (direction === ArrowKeyEnum.ArrowLeft ? tabulation[rowNumber + summand]?.bars?.length - 1 : 0);

      rowIndex = currentRow.bars[barNumber + summand] ? rowNumber : rowNumber + summand;

      column = direction === ArrowKeyEnum.ArrowLeft ? bar?.items?.length - 1 : 0;
    }

    if (bar === null) {
      this.tabulatureService?.createNewBar(barNumber, currentRow)
      this.tabulatureService?.renderBars();
    }

    const barItem: BarItem | null = bar?.items[column][stringNumber - 1] ?? null;

    if (!bar || !barItem) {
      return null;
    }

    return {
      x: barItem.x,
      y: barItem.y,
      columnNumber: column,
      rowNumber: rowIndex,
      stringNumber,
      barNumber: barIndex
    }
  }

  private moveVertical(direction: ArrowKey, currentRow: Row, stringNumber: number, columnNumber: number, rowNumber: number, barNumber: number, tabulation: Row[]):HighlightPosition | null {
    let column: number= columnNumber;
    let string: number = stringNumber;
    let bar: Bar | null;
    let barIndex: number = barNumber;
    let row: Row | null = currentRow;
    let rowIndex: number = rowNumber;

    const summand: number = direction === ArrowKeyEnum.ArrowUp ? -1 : 1;
    string += summand;

    if (string > 6 || string < 1) {
      string = direction === ArrowKeyEnum.ArrowDown ? 6 : 1;
      row = tabulation[rowNumber + summand] ?? null;
      rowIndex = rowNumber + summand;
    }

    bar = row?.bars[barNumber] ?? null;

    if (bar === null) {
      bar = row?.bars[barNumber - 1];
      barIndex = row?.bars?.length - 1;
      column = row?.bars[barIndex]?.items?.length - 1;
    }

    if (row === null || bar === null ) {
      return null;
    }

    const barItem: BarItem = bar.items[column][string - 1];

    return  {
      x: barItem.x,
      y: barItem.y,
      rowNumber: rowIndex,
      columnNumber: column,
      stringNumber: string,
      barNumber: barIndex
    }
  }


  private mergeDividedBars(tabulation: Row[], currentRow: Row,  rowNumber: number, barNumber: number): Bar | null {
    const tabulationCopy: Row[] = DeepCopy(tabulation);
    const currentRowCopy: Row = DeepCopy(currentRow);
    const currentBar: Bar | null = currentRowCopy.bars[barNumber] ?? null;
    const barFragments: Bar[] = tabulationCopy.flatMap((row: Row) =>
      row.bars.filter((bar: Bar) =>
        bar.id === currentBar?.id));


    if (currentBar === null || barFragments.length === 0) {
      return null;
    }

    if (!this.tabulatureService?.isDivided(currentBar)) {
      return null;
    }

    currentBar.items = currentBar.items.concat(barFragments.flatMap((bar: Bar) => bar.items));
    return currentBar;
  }
}
