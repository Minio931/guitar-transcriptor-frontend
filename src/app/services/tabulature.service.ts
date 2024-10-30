import {computed, Injectable, signal} from "@angular/core";
import {HiglightItemPosition} from "../types/higlight-item-position.type";
import {TabObjectItem} from "../types/tab-object-item.type";
import {TabItem} from "../types/tab-item.type";
import {TabulationGridItem} from "../types/tabulation-grid-item.type";
import {TabInterface} from "../configs/tab-interface.config";
import {MousePosition} from "../types/mouse-position.type";
import {Regex} from "../configs/regex.config";
import {ArrowKeyEnum} from "../enums/arrow-key.enum";
import {ArrowKey} from "../types/arrow-key.type";
import {TimeSignature} from "../types/time-signature.type";
import {TabObjectType} from "../enums/tab-object-type.enum";
import {Position} from "../types/position.type";

const INITIAL_HIGHLIGHT_POSITION: HiglightItemPosition = {x: -100, y: 0};
const INITIAL_SPACE_BETWEEN_ITEMS: number = 70;
const INITIAL_GUITAR_TUNING = ["E", "A", "D", "G", "B", "E"];
const INITIAL_TIME_SIGNATURE: TimeSignature = {
  numerator: 4,
  denominator: 4
}

@Injectable({providedIn: "root"})
export class TabulatureService {
  readonly NUMBER_OF_LINES: number = 6;
  readonly SPACE_BETWEEN_LINES: number = 25;
  spaceBetweenItems = signal<number>(INITIAL_SPACE_BETWEEN_ITEMS);
  timeSignature = signal<TimeSignature>(INITIAL_TIME_SIGNATURE)
  tabObject = signal<TabObjectItem[]>([]);
  barLinesPositions = signal<Position[]>([]);
  tabLines = signal<string>("");
  barLines = signal<string>("");
  activeGuitarTuning = signal<string[]>(INITIAL_GUITAR_TUNING);
  tabItemsPositions = signal<TabItem[]>([]);
  tabulationGrid = signal<TabulationGridItem[]>([]);
  highlightedTabulationGridItem = signal<TabulationGridItem | null>(null);
  highlightedItemPosition = signal<HiglightItemPosition>(INITIAL_HIGHLIGHT_POSITION);
  currentBarNumber = signal<number>(0);
  numberOfBars = signal<number>(1);
  fretNumber: string = ""
  public containerWidth = signal<number>(0);
  tabulationLinesWidth = computed<number>(() => {
    return (this.containerWidth() - TabInterface.PADDING) - (this.containerWidth() %
      (this.spaceBetweenItems()  * this.timeSignature().denominator)) - TabInterface.PADDING;
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

  private setHighlightPosition(highlightItem: TabulationGridItem) {
    const xPosition: number = (highlightItem.x / this.spaceBetweenItems()) - 1;
    const item = this.findTabItem(xPosition, highlightItem.stringNumber);

    const shiftToCenter: number = (TabInterface.FONT_SIZE + (TabInterface.FONT_SIZE / 2)) / 2;

    this.highlightedTabulationGridItem.set(highlightItem);
    this.highlightedItemPosition.set({
      x: highlightItem.x - shiftToCenter + ( !!item && item.fretNumber > 9 ? TabInterface.FONT_SIZE / 2 : TabInterface.FONT_SIZE / 4),
      y: highlightItem.y - shiftToCenter
    });
  }

  private findTabItem(xPosition: number, stringNumber: number): TabObjectItem | null  {
     return this.tabObject().find((item: TabObjectItem) => item.positionX === xPosition && item.stringNumber === stringNumber) ?? null;
  }

  private isItemValidToInsert(fretNumber: string): boolean {
    return Regex.isNumber.test(fretNumber) && this.highlightedItemPosition().x !== INITIAL_HIGHLIGHT_POSITION.x;
  }

  private isPlaceOccupied(stringNumber: number, stringNumberItem: number,  xPosition: number, xItemPosition: number): boolean {
    return stringNumber === stringNumberItem && xPosition === xItemPosition;
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

  private checkIfAddNextBar() {
    const barLinesPositionLength = this.barLinesPositions().length;
    const barLastItemPosition: number = this.barLinesPositions()[barLinesPositionLength - 1].x
     if (this.highlightedTabulationGridItem()!.x > barLastItemPosition) {
       this.numberOfBars.set(this.numberOfBars() + 1);
       this.barLines.set(this.generateBarLines());
     }
  }

  private moveHighlightRectangle(validatingFunction: (itemX: number, itemY:number, x: number, y: number) => {}, direction: ArrowKey) {
    let {x, y} = this.highlightedTabulationGridItem()!;
    const availableGridItems = this.tabulationGrid().filter((item: TabulationGridItem) => validatingFunction(item.x, item.y, x, y));
    if (availableGridItems.length === 0){
      return;
    }

    let sortedItems: TabulationGridItem[] = [];

    if (direction === ArrowKeyEnum.ArrowLeft || direction === ArrowKeyEnum.ArrowRight) {
      sortedItems = availableGridItems.sort((a, b) => this.sortingByOneAxis(a.x, b.x, x));
    } else {
      sortedItems = availableGridItems.sort((a, b) => this.sortingByOneAxis(a.y, b.y, y));
    }


    this.setHighlightPosition(sortedItems[0]);
    this.checkIfAddNextBar();
  }

  public generateTabLines(): string {
    const tabLines: string[] = [];
    for (let i = 1; i <= this.NUMBER_OF_LINES; i++) {
      const x: number = TabInterface.PADDING;
      const y: number = i * this.SPACE_BETWEEN_LINES;
      const h: number = this.tabulationLinesWidth() ?? 0;
      tabLines.push(this.generateTabLine(x, y, h));
    }

    return tabLines.join(" ");
  }

  public generateBarLines(): string {
    const barLines: string[] = [];
    for (let i = 1; i <= this.numberOfBars(); i++) {
      const x: number = TabInterface.PADDING + (this.spaceBetweenItems() * 2) + (this.spaceBetweenItems()  * this.timeSignature().denominator * i);
      const y: number = this.SPACE_BETWEEN_LINES;
      const v: number = this.NUMBER_OF_LINES * this.SPACE_BETWEEN_LINES;
      this.barLinesPositions.set(
        [
          ...this.barLinesPositions(),
          {x, y}
      ]);
      barLines.push(this.generateBarLine(x, y, v));
    }

    return barLines.join(" ");
  }

  public generateTabulationGrid(): void {
    const numberOfElementsOnTab: number = Math.floor(this.tabulationLinesWidth() / this.spaceBetweenItems());
    for (let i: number = 0; i < numberOfElementsOnTab; i++) {
      for (let j: number = 1; j <= this.NUMBER_OF_LINES; j++) {
        const x: number = i + 1 % this.timeSignature().denominator === 0
          ? TabInterface.PADDING + (this.spaceBetweenItems() * 1.5) + (i * this.spaceBetweenItems())
          : (TabInterface.PADDING * 2) + (this.spaceBetweenItems() * 1.5) + (i * this.spaceBetweenItems());

        const y: number = (this.SPACE_BETWEEN_LINES * j);
        this.tabulationGrid.set([...this.tabulationGrid(), {x, y, stringNumber: j}]);
      }
    }
  }

  public generateTabItemsPositions(): void {
    this.tabItemsPositions.set([]);
    this.tabObject().forEach((item: TabObjectItem, index: number) => {
      const positionX: number = TabInterface.PADDING  + (item.positionX * (this.spaceBetweenItems()));
      const positionY: number = (this.SPACE_BETWEEN_LINES * item.stringNumber) + ((TabInterface.FONT_SIZE / 2) - TabInterface.STROKE_WIDTH)
      this.tabItemsPositions.set([...this.tabItemsPositions(), {x: positionX, y: positionY, fretNumber:item.fretNumber}]);
    })
  }

  public findSpotToHighlight(mousePosition: MousePosition) {
    const { x, y } = mousePosition;
    const nearestGridItems: TabulationGridItem[] = [];

    this.tabulationGrid().forEach((item: TabulationGridItem) => {
      if (this.isItemNearMouse(item.x, item.y, x, y)) {
        nearestGridItems.push(item);
      }
    })

    if (nearestGridItems.length === 0) {
      return;
    }

    nearestGridItems.sort((a: TabulationGridItem, b: TabulationGridItem) => {
      return (Math.pow((x - a.x), 2) + Math.pow((a.y - y), 2)) - (Math.pow((x - b.x), 2) + Math.pow((b.y - y), 2));
    })

    const nearestGridItem: TabulationGridItem = nearestGridItems[0];

    this.setHighlightPosition(nearestGridItem);
  }

  public insertTabItem(fretNumber: string, positionX: number, stringNumber: number) {
    if (!this.isItemValidToInsert(fretNumber)) {
      return;
    }
    this.fretNumber += fretNumber;

    setTimeout(() => {
      this.fretNumber = "";
    }, 1500)

    const tabItem: TabObjectItem = {
      positionX: (positionX / this.spaceBetweenItems()) - 1,
      stringNumber,
      fretNumber: Number(this.fretNumber) < 25 ? Number(this.fretNumber) :  Number(fretNumber),
      type: TabObjectType.FretNumber,
      barNumber: 1,
    }
    if (this.isValidTwoDigitFretNumber(Number(this.fretNumber))) {
      const shiftToCenter: number = (TabInterface.FONT_SIZE + (TabInterface.FONT_SIZE / 2)) / 2;
      this.highlightedItemPosition.set({
        x: positionX - shiftToCenter + (TabInterface.FONT_SIZE / 2),
        y: this.highlightedItemPosition().y
      });
    }

    this.tabObject.set([
      ...this.tabObject().filter((item: TabObjectItem) => !this.isPlaceOccupied(item.stringNumber, tabItem.stringNumber, item.positionX, tabItem.positionX)),
      tabItem
    ]);
  }

  public highlightNearestItem(direction: ArrowKey) {
    switch (direction) {
      case ArrowKeyEnum.ArrowUp:
          this.moveHighlightRectangle(this.arrowUpCheck, ArrowKeyEnum.ArrowUp)
        break;
      case ArrowKeyEnum.ArrowRight:
          this.moveHighlightRectangle(this.arrowRightCheck, ArrowKeyEnum.ArrowRight)
        break;
      case ArrowKeyEnum.ArrowDown:
          this.moveHighlightRectangle(this.arrowDownCheck, ArrowKeyEnum.ArrowDown)
        break;
      case ArrowKeyEnum.ArrowLeft:
          this.moveHighlightRectangle(this.arrowLeftCheck, ArrowKeyEnum.ArrowLeft)
        break;
      default:

        break;
    }
  }

}
