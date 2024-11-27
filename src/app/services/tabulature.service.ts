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
import {ArrowKey} from "../types/arrow-key.type";
import {ArrowKeyEnum} from "../enums/arrow-key.enum";
import {ExtendedBarItem} from "../types/extended-bar-item.type";
import {NoteEnum} from "../enums/note.enum";
import {HighlightService} from "./highlight.service";
import {TabRenderService} from "./tab-render.service";

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

  defaultNoteType = signal<NoteEnum>(NoteEnum.QUARTER_NOTE)

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

  constructor(
    private highlightService: HighlightService,
    private tabRenderService: TabRenderService,
  ) { }

  public get highlight$(): HighlightPosition | null {
    return this.highlightService.highlight;
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

  public renderBars() {
    let tabulation: Row[]  = this.adjustingRows(this.tabulation())
    this.tabulation.set(tabulation);
  }

  public findSpotToHighlight(mousePosition: MousePosition, rowNumber: number) {
    const row = this.tabulation()[rowNumber];
    const highlight = this.highlightService.findNearestHighlight(mousePosition, row, this.spaceBetweenItems(), this.SPACE_BETWEEN_LINES)
    if (highlight) {
      this.highlightService.setHighlightPosition(highlight);
    }
  }

  public highlightNearestItem(direction: ArrowKey) {
    if (!!this.highlight$) {
      this.fretNumber = ''
      const highlight = this.highlightService.moveHighlight(direction, this.tabulation(), this.highlight$);
      if (highlight) {
        this.highlightService.setHighlightPosition(highlight);
      }
    }
  }

  public insertTabElement(tabObjectType: TabObjectType, fretNumber?: string) {
    switch (tabObjectType) {
      case TabObjectType.Note:
        if (!!fretNumber && this.isItemValidToInsert(fretNumber ?? '') ) {
          this.insertFretNumber(fretNumber);
        }
        break;
    }
  }

  public removeTabElement() {
    if (!this.highlight$) {
      return;
    }
    const {rowNumber, columnNumber, barNumber, stringNumber} = this.highlight$;
    const tabulation = this.tabulation();
    delete tabulation[rowNumber].bars[barNumber].items[columnNumber][stringNumber - 1].tabObject;
    this.tabulation.set(tabulation);
    console.log(this.tabulation())
  }

  private createNewBar(previousIndex: number, row: Row): void {
    const previousBar: Bar = row.bars[previousIndex];
    const newBarElement: Bar = {
      ...previousBar,
      id: previousBar.id++,
      items: this.initializeBarItems(0),
      repeatStarts: false,
      repeatEnds: false,
    }

    const tabulation = this.tabulation();
    tabulation[tabulation.length - 1].bars.push(newBarElement);

    this.tabulation.set(tabulation);
  }

  private isItemValidToInsert(fretNumber: string): boolean {
    return Regex.isNumber.test(fretNumber) && !!this.highlight$;
  }

  private getNoteWidth(note: NoteEnum): number {
    switch (note) {
      case NoteEnum.WHOLE_NOTE:
        return TabInterface.durationOneLength;
      case NoteEnum.HALF_NOTE:
        return TabInterface.durationTwoLength;
      case NoteEnum.QUARTER_NOTE:
        return TabInterface.durationFourLength
      case NoteEnum.EIGHTH_NOTE:
        return TabInterface.durationEightLength
      case NoteEnum.SIXTEENTH_NOTE:
        return TabInterface.durationSixteenLength
      case NoteEnum.THIRTY_SECOND_NOTE:
        return TabInterface.durationThirtyTwoLength
    }
  }

  private defineObjectNote(bar: Bar, barItem: BarItem, columnNumber: number) {
    if(!!barItem.note?.type){
      return barItem;
    }

    const allBarItems = bar.items.flat(Infinity) as BarItem[];
    const noteType =  allBarItems.find(item => !!item.note && (item?.xIndex ?? - 1) < columnNumber)?.note?.type ?? this.defaultNoteType()

    barItem.note = {
      type: noteType,
      width: this.getNoteWidth(noteType)
    }

    return barItem
  }

  private insertFretNumber(fretNumber: string) {
      const tabulation = this.tabulation();
      if (!!this.highlight$) {
        const {rowNumber, columnNumber, stringNumber, barNumber} = this.highlight$;

        const bar = tabulation[rowNumber].bars[barNumber];
        const barItem: BarItem = tabulation[rowNumber].bars[barNumber].items[columnNumber][stringNumber - 1];

        this.fretNumber += fretNumber;

        setTimeout(() => {
          this.fretNumber = ""
        }, 1500)

        if (Number(this.fretNumber) > 25) {
          this.fretNumber = fretNumber;
        }



        barItem.tabObject = {
          barNumber,
          fretNumber: Number(this.fretNumber),
          positionX: columnNumber,
          stringNumber: stringNumber,
          type: TabObjectType.Note
        }

        barItem.note = this.defineObjectNote(bar, barItem, columnNumber).note;
        this.tabulation.set(tabulation);
      }
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
      const barWidth = this.tabRenderService.calculateLengthOfBar(bar);

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
      const { tabulationPath } = this.tabRenderService.renderRowPath(row.bars);
      row.path = tabulationPath;
    });


    return this.tabRenderService.recalculateBarItemsPositions(newTabulation);
  }


}
