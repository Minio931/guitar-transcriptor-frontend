import {computed, inject, Injectable, Injector, signal} from "@angular/core";
import {HighlightPosition} from "../types/highlight-position.type";
import {BarItem} from "../types/bar-item.type";
import {TabInterface} from "../configs/tab-interface.config";
import {Regex} from "../configs/regex.config";
import {TimeSignature} from "../types/time-signature.type";
import {TabObjectType} from "../enums/tab-object-type.enum";
import {TabulationRender} from "../types/tabulation-render.type";
import {Bar} from "../types/bar.type";
import {Row} from "../types/row.type";
import {MousePosition} from "../types/mouse-position.type";
import {ArrowKey} from "../types/arrow-key.type";
import {NoteEnum} from "../enums/note.enum";
import {HighlightService} from "./highlight.service";
import {TabRenderService} from "./tab-render.service";
import {GetNoteWidth} from "../functions/get-note-width.function";
import {BarError} from "../types/bar-error.type";
import {GetOneItemPerColumn} from "../functions/get-one-item-per-column.function";
import {GetColumnItemWidthFunction} from "../functions/get-column-item-width.function";
import {TranslocoService} from "@jsverse/transloco";
import {DeepCopy} from "../functions/deep-copy.function";

const INITIAL_SPACE_BETWEEN_ITEMS: number = 70;
const INITIAL_GUITAR_TUNING = ["E", "A", "D", "G", "B", "E"];
const INITIAL_TIME_SIGNATURE: TimeSignature = {
  numerator: 4,
  denominator: 4
}


@Injectable({providedIn: "root"})
export class TabulatureService {
  //TODO: Przenieść do configu albo jako const
  readonly NUMBER_OF_LINES: number = 6;

  readonly SPACE_BETWEEN_LINES: number = 25;

  injector = inject(Injector)
  highlightService = this.injector.get(HighlightService);
  tabRenderService = inject(TabRenderService);
  translocoService = inject(TranslocoService);

  spaceBetweenItems = signal<number>(INITIAL_SPACE_BETWEEN_ITEMS);

  activeGuitarTuning = signal<string[]>(INITIAL_GUITAR_TUNING);

  tabulation = signal<Row[]>([]);

  highlight = signal<HighlightPosition | null>(null);

  defaultNoteType = signal<NoteEnum>(NoteEnum.QUARTER_NOTE)

  tabulationRender = signal<TabulationRender>({
    numberOfBars: 1,
    numberOfTabRows: 1,
  });

  fretNumber: string = ""

  public containerWidth = signal<number>(0);

  public barErrors = computed<BarError[]>(() => {
    const tabulationCopy = DeepCopy(this.tabulation());
    const barErrors = tabulationCopy.map((row, rowIndex) => {
      const errors: BarError[] = [];
      row.bars.map((bar: Bar, barIndex: number) => {
        const timeSignature: TimeSignature = bar.timeSignature;
        let numberOfColumns = 0;
        let barValue = 0;
        const notes: number[] = [];
        const barCopy = DeepCopy(bar);
        const mergedBar = bar.divided ? this.mergeDividedBars(tabulationCopy, barCopy) : bar;
        mergedBar.items.forEach((barItem: BarItem[]) => {
          const item = barItem[0];

          if (!!item.note?.type && (item.tabObject?.type === TabObjectType.Note || item.tabObject?.type === TabObjectType.Pause)) {
            numberOfColumns++;
            barValue += 1/Number(item.note?.type);
            notes.push(Number(item.note?.type));
          }
        })

        const difference = barValue - (timeSignature.numerator / timeSignature.denominator);

        if (difference < 0) {
          const suggestedNotes = this.suggestNotesForError(difference);

          errors.push({
            rowIndex: rowIndex,
            barIndex: barIndex,
            errorMessage: this.translocoService.translate('_Error.Bar is too short. Suggested note(s) to add:', {notes: this.formatNotesFraction(suggestedNotes)})
          })
        } else if (difference > 0) {
          const suggestedNotes = this.suggestNotesForError(difference, notes);
          errors.push({
            rowIndex: rowIndex,
            barIndex: barIndex,
            errorMessage: this.translocoService.translate('_Error.Bar is too long. Suggested note(s) to remove:', {notes: this.formatNotesFraction(suggestedNotes)})
          })
        }
      })

      return errors;
    })

    return barErrors.flat(Infinity) as BarError[];
})

  public updateTabulation(tabulation: Row[]) {
    this.tabulation.set(tabulation);
    this.renderBars();
  }

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
            repeatEnds: false,
            divided: false
          });
          currentBar++;
        }
      }
    }

    this.tabulation.set(tabulation);
  }

  public renderBars() {
    let tabulation: Row[]  = this.adjustingRows(this.tabulation())
    tabulation = this.tabRenderService.recalculateBarItemsPositions(tabulation);
    tabulation.forEach((row: Row) => {
      const { tabulationPath, additionalItems } = this.tabRenderService.renderRowPath(row.bars, tabulation);
      row.path = tabulationPath;
      row.additionalItems = additionalItems;
    });

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
      const tabulation = JSON.parse(JSON.stringify(this.tabulation()));
      const highlight = this.highlightService.moveHighlight(direction, tabulation, this.highlight$);
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

  public createNewColumn(row: number, bar: number, column: number, previousBarItem: BarItem) {
    const tabulation = [...this.tabulation()];

    const newBarItems: BarItem[] = [];

    for (let i = 0; i < TabInterface.NUMBER_OF_LINES; i++) {
      newBarItems[i] = {
        ...previousBarItem,
        x: previousBarItem.x + GetNoteWidth(previousBarItem.note?.type ?? NoteEnum.QUARTER_NOTE),
        xIndex: column,
        y: TabInterface.SPACE_BETWEEN_LINES * (i + 1),
        tabObject: {
          type: TabObjectType.Note
        },
        stringNumber: i + 1,
      }
    }


    tabulation[row].bars[bar].items.push(newBarItems);
    this.updateTabulation(tabulation);
  }

  public removeTabElement() {
    if (!this.highlight$) {
      return;
    }

    const {rowNumber, columnNumber, barNumber, stringNumber} = this.highlight$;
    let tabulation = this.tabulation();
    const bar: Bar = tabulation[rowNumber].bars[barNumber];
    const column: BarItem[] = tabulation[rowNumber].bars[barNumber].items[columnNumber];
    const item: BarItem = tabulation[rowNumber].bars[barNumber].items[columnNumber][stringNumber - 1];

    if (this.isPauseElement(item)) {
      this.deletePauseElement(tabulation[rowNumber].bars[barNumber].items[columnNumber]);
    }

    if (this.isNoteElement(item)) {
      this.deleteNoteElement(item);
    }

    if (this.isColumnEmpty(column) && this.barHasMoreThanOneItem(bar)) {
     tabulation = this.deleteColumn(tabulation, this.highlight$);
    }

    console.log(tabulation);
    // this.tabulation.set(tabulation);
    this.updateTabulation(tabulation);
  }


  public createNewBar(previousIndex: number, row: Row): void {
    const previousBar: Bar = row.bars[previousIndex];
    const newBarElement: Bar = {
      ...previousBar,
      divided: false,
      id: previousBar.id + 1,
      items: this.initializeBarItems(0),
      repeatStarts: false,
      repeatEnds: false,
    }

    const tabulation = this.tabulation();
    tabulation[tabulation.length - 1].bars.push(newBarElement);

    this.tabulation.set(tabulation);
  }

  public updateTimeSignature(timeSignature: TimeSignature) {

    if (!!this.highlight$) {
      const {rowNumber, barNumber} = this.highlight$;
      const newTabulation = this.tabulation();
      newTabulation[rowNumber].bars[barNumber].timeSignature = timeSignature;
      this.updateTabulation(newTabulation);
    }
  }

  public isDivided( bar: Bar) {
    return bar?.divided ?? false;
  }

  private isItemValidToInsert(fretNumber: string): boolean {
    return Regex.isNumber.test(fretNumber) && !!this.highlight$;
  }

  private defineObjectNote(bar: Bar, barItem: BarItem, columnNumber: number) {
    if(!!barItem.note?.type){
      return barItem;
    }

    const allBarItems = bar.items.flat(Infinity) as BarItem[];
    const noteType =  allBarItems.find(item => !!item.note && (item?.xIndex ?? - 1) < columnNumber)?.note?.type ?? this.defaultNoteType()

    barItem.note = {
      type: noteType,
      width: GetNoteWidth(noteType)
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

  private initializeBarItems(barNumber: number): BarItem[][] {
    let barItems: BarItem[][] = [];
    for (let i = 0; i < 4; i++) {
      barItems[i] = []
      for (let j = 0; j < TabInterface.NUMBER_OF_LINES; j++) {
          barItems[i][j] = {
            x: TabInterface.PADDING + (barNumber * (4 * TabInterface.durationFourLength) + (i * TabInterface.durationFourLength)),
            y: this.SPACE_BETWEEN_LINES + (this.SPACE_BETWEEN_LINES * j),
            stringNumber: j + 1,
            xIndex: i,
            note: {
              type: NoteEnum.QUARTER_NOTE,
              width: GetNoteWidth(NoteEnum.QUARTER_NOTE),
            },
            tabObject: {
              type: TabObjectType.Note
            }
          }
      }
    }

    return barItems;
  }


  private adjustingRows(tabulation: Row[]): Row[] {
    const allBars = tabulation.flatMap(row => row.bars);
    let newTabulation: Row[] = [];
    let currentBars: Bar[] = [];
    let currentRowWidth = 0;
    let rowId = 0;
    const indexesToSkip: number[] = [];

    for (let i = 0; i < allBars.length; i++) {
      if (indexesToSkip.includes(i)) {
        continue;
      }

      const bar = allBars[i];
      const barWidth = this.tabRenderService.calculateLengthOfBar(bar);

      if (this.canFitInRow(currentRowWidth, barWidth)) {
        currentBars = this.mergeWithPreviousOrPush(currentBars, bar, i, currentRowWidth);
        const newBarWidth = this.tabRenderService.calculateLengthOfBar(currentBars[currentBars.length - 1]);
        currentBars[currentBars.length - 1].divided = allBars[i + 1]?.id === currentBars[currentBars.length - 1].id;
        currentRowWidth += newBarWidth;
        continue;
      }

      const { fittingBar, restBar } = this.divideBarToFit(bar, currentRowWidth);

      if (this.isDivided(allBars[i + 1]) && restBar?.id === allBars[i + 1]?.id){
        restBar.items = restBar.items.concat(allBars[i + 1].items);
        restBar.divided = fittingBar.items.length > 0;
        indexesToSkip.push(i + 1);
      }

      if (this.isDivided(currentBars[currentBars.length - 1]) && currentBars[currentBars.length - 1].id === fittingBar.id && fittingBar.items.length > 0) {
        currentBars[currentBars.length - 1].items = currentBars[currentBars.length - 1].items.concat(fittingBar.items);
        currentBars[currentBars.length - 1].divided = true;
      } else if (fittingBar.items.length > 0) {
        currentBars.push({...fittingBar, id: fittingBar.id ?? i + 1});
        currentRowWidth = 0;
      }

      newTabulation.push({
        id: rowId++,
        bars: [...currentBars],
        path: '',
      });

      currentBars = [{...restBar, id: fittingBar.id}];
      currentRowWidth = this.tabRenderService.calculateLengthOfBar(restBar);

    }

    if (currentBars.length > 0) {
      newTabulation.push({
        id: rowId++,
        bars: [...currentBars],
        path: '',
      });
    }

    return newTabulation;
  }

  private createTimeSignature(timeSignature: TimeSignature): BarItem[] {
    const timeSignatureElement: BarItem = {
      x: -1,
      y: TabInterface.SPACE_BETWEEN_LINES,
      tabObject: {
        type: TabObjectType.TimeSignature,
      },
    }

    return Array.from({length: TabInterface.NUMBER_OF_LINES}, (_, i) => {
      return {
        ...timeSignatureElement,
        y: TabInterface.SPACE_BETWEEN_LINES * (i + 1),
      }
    });
  }


  private suggestNotesForError(difference: number, notes?:  number[]) {
    let remaining = Math.abs(difference);
    const suggestedNotes: number[] = [];
    const iteratingNotes: number[] | NoteEnum[]  = notes?.sort((a, b) => b - a) ?? Object.values(NoteEnum);

    for ( const note of iteratingNotes) {
      const noteValue = 1/Number(note);

      while (remaining >= noteValue) {
        remaining -= noteValue;
        suggestedNotes.push(Number(note));
        remaining = parseFloat(remaining.toFixed(2));
      }
    }

    if (remaining > 0) {
      suggestedNotes.push(Array.isArray(iteratingNotes)
        ? (iteratingNotes as number[])[iteratingNotes.length - 1]
        : Number(NoteEnum.THIRTY_SECOND_NOTE));
    }

    return suggestedNotes;
  }

  private formatNotesFraction(notes: number[]) {
    return notes.map(note => `<span><sup>1</sup>/<sub>${note}</sub></span>`).join(', ');
  }

  private canFitInRow(currentRowWidth: number, barWidth: number) {
    return currentRowWidth + barWidth < this.containerWidth();
  }

  private divideBarToFit(bar: Bar, currentRowWidth: number): {fittingBar: Bar, restBar: Bar} {
      const widthToFit = this.containerWidth() - currentRowWidth - TabInterface.PADDING;
      const fittingBarItems = this.extractFittingBarItems(bar, widthToFit);
      const restBarItems = bar.items.filter((item: BarItem[]) => !fittingBarItems.includes(item));
      const barPreviouslyDivided = this.isDivided(bar);

      return {
        fittingBar: {
          ...bar,
          items: fittingBarItems,
          divided: barPreviouslyDivided || restBarItems.length > 0
        },
        restBar: {
          ...bar,
          items: restBarItems,
          divided: barPreviouslyDivided || fittingBarItems.length > 0
        }
      }
  }

  private extractFittingBarItems(bar: Bar, widthToFit: number): BarItem[][] {
    const barItems = GetOneItemPerColumn(bar.items);

    const splitIndex = barItems.reduce((acc, curr: BarItem) => {
      const width = GetColumnItemWidthFunction(curr?.tabObject?.type, curr?.note?.type);
      if (acc.width + width < widthToFit) {
        acc.index = acc.index + 1;
        acc.width += width;
      }
      return acc;
    }, {width: 0, index: 0}).index;

    return bar.items.slice(0, splitIndex);
  }

  private mergeWithPreviousOrPush(currentBars: Bar[], bar: Bar, index: number, currentRowWidth: number): Bar[] {
    if (currentBars.length === 0) {
      currentBars.push({...bar, id: index + 1});
      return currentBars;
    }

    if (this.isDivided(bar)) {
      return this.mergeFittingBarItems(currentBars, bar, currentRowWidth);
    }

    currentBars.push(bar);
    return currentBars;
  }

  private mergeFittingBarItems(currenBars: Bar[], bar: Bar, currentRowWidth: number) {
    const {fittingBar, restBar} = this.divideBarToFit(bar, currentRowWidth);

    if (fittingBar.items.length > 0 && currenBars[currenBars.length - 1].divided && fittingBar.id === currenBars[currenBars.length - 1].id) {
      currenBars[currenBars.length - 1].items = currenBars[currenBars.length - 1].items.concat(fittingBar.items);
    } else if (fittingBar.items.length > 0) {
      currenBars.push({...fittingBar, id: fittingBar.id});
    }

    if (restBar.items.length > 0) {
      currenBars.push(restBar);
    }

    return currenBars;
  }

  private mergeDividedBars(rows: Row[], bar: Bar) {
    const barFragments = this.findBarFragments(rows, bar);
    bar.items = barFragments.flatMap(bar => bar.items);
    return bar;
  }

  private findBarFragments(rows: Row[], bar: Bar): Bar[] {
    return rows.flatMap(row => row.bars.filter(otherBar => bar.id === otherBar.id));
  }

  private isPauseElement(barItem: BarItem): boolean {
    return barItem.tabObject?.type === TabObjectType.Pause;
  }

  private isNoteElement(barItem: BarItem): boolean {
    return barItem.tabObject?.type === TabObjectType.Note;
  }

  private isColumnEmpty(column: BarItem[]): boolean {
    return column.every(item => {
      return item.tabObject?.type === TabObjectType.Note || !!item.tabObject?.fretNumber;
    });
  }

  private barHasMoreThanOneItem(bar: Bar): boolean {
    return bar.items.filter(item => !item.find(item => item.tabObject?.type === TabObjectType.TimeSignature)).length > 1;
  }

  private deletePauseElement(column: BarItem[]): BarItem[] {
    return column.map(item => {
      item.tabObject = {
        type: TabObjectType.Note
      }
      return item;
    })
  }

  private deleteNoteElement(barItem: BarItem): BarItem {
    if (!!barItem.tabObject) {
      delete barItem.tabObject.fretNumber;
    }

    return barItem;
  }

  private deleteColumn(tabulation: Row[], {rowNumber, columnNumber, barNumber}: HighlightPosition): Row[] {
     tabulation[rowNumber].bars[barNumber].items.splice(columnNumber, 1);
     return tabulation;
  }
}
