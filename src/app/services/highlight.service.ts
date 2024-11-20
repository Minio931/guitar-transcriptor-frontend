import {Injectable, Signal, signal} from "@angular/core";
import {HighlightPosition} from "../types/highlight-position.type";
import {Row} from "../types/row.type";
import {MousePosition} from "../types/mouse-position.type";
import {Bar} from "../types/bar.type";
import {BarItem} from "../types/bar-item.type";
import {ArrowKey} from "../types/arrow-key.type";
import {ArrowKeyEnum} from "../enums/arrow-key.enum";


@Injectable({providedIn: 'root'})
export class HighlightService {
  private _highlight = signal<HighlightPosition | null>(null);

  get highlight():HighlightPosition | null {
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

    column += summand;

    if (column < 0 || column >= currentRow.bars[barIndex]?.items?.length) {
      bar = currentRow.bars[barIndex + summand] ??
        (tabulation[rowIndex + summand]?.bars[direction === ArrowKeyEnum.ArrowLeft ? tabulation[rowNumber + summand]?.bars.length - 1 : 0]);

      barIndex = currentRow.bars[barIndex + summand]
        ? barNumber + summand
        : (direction === ArrowKeyEnum.ArrowLeft ? tabulation[rowNumber + summand]?.bars?.length - 1 : 0);

      rowIndex = currentRow.bars[barNumber + summand] ? rowNumber : rowNumber + summand;

      column = direction === ArrowKeyEnum.ArrowLeft ? bar?.items?.length - 1 : 0;
    }

    if (bar === null) {

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
}
