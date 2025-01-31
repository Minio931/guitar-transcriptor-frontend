import {inject, Injectable} from "@angular/core";
import {TabulatureService} from "./tabulature.service";
import {Row} from "../types/row.type";
import {TabObjectType} from "../enums/tab-object-type.enum";
import {Option} from "../types/option.type";
import {HighlightPosition} from "../types/highlight-position.type";
import {NoteEnum} from "../enums/note.enum";
import {BarItem} from "../types/bar-item.type";
import {Bar} from "../types/bar.type";
import {GetNoteWidth} from "../functions/get-note-width.function";
import {TimeSignature} from "../types/time-signature.type";
import {TabInterface} from "../configs/tab-interface.config";
import {FullLineElement} from "../enums/full-line-element.enum";
import {
  TimeSignatureService
} from "../pages/tabulature-editor/_components/time-signature-dialog/time-signature.service";
import {DeepCopy} from "../functions/deep-copy.function";


@Injectable({providedIn: 'root'})
export class ContextMenuService {
  tabulatureService: TabulatureService = inject(TabulatureService);
  timeSignatureService: TimeSignatureService = inject(TimeSignatureService);


  public get tabulation$(): Row[] {
    return this.tabulatureService.tabulation();
  }

  public get highlight$(): HighlightPosition | null{
    return this.tabulatureService.highlight$;
  }

  public tabContextAction(type: TabObjectType, option: Option) {
    switch (type) {
      case TabObjectType.Note:
        if (this.isNoteEnum(option)) {
          this.modifyBarElements(option);
        }

        break;
      case TabObjectType.TimeSignature:
        if (option === FullLineElement.TIME_SIGNATURE) {
          this.modifyTimeSignatureForBar();
        }
        break;
      case TabObjectType.Pause:
        if (this.isNoteEnum(option)) {
          this.insertPause(option);
        }
        break;
    }
  }

  public openTimeSignatureDialog() {
    this.timeSignatureService.showDialog();
  }

  private modifyBarElements(note: NoteEnum) {
    if (!this.highlight$) {
      return;
    }
    const {rowNumber, columnNumber, barNumber} = this.highlight$;

    const newTabulation = this.tabulation$;
    let bar = this.tabulation$[rowNumber].bars[barNumber];

    if (this.barHasItems(bar)) {
      bar.items[columnNumber] = this.modifyBarColumn(bar.items[columnNumber], note)
    } else {
      bar = this.modifyBar(bar, note);
    }

    newTabulation[rowNumber].bars[barNumber] = bar;

    this.tabulatureService.updateTabulation(newTabulation)
  }

  private modifyTimeSignatureForBar() {

  }

  private isNoteEnum(option: any): option is NoteEnum {
    return Object.values(NoteEnum).includes(option);
  }

  private barHasItems(bar: Bar): boolean {
    return bar.items.some((barItems: BarItem[] ) => barItems.some((item: BarItem) => !!item?.tabObject?.fretNumber));
  }

  private modifyBar(bar: Bar, note: NoteEnum): Bar {
    const barItems: BarItem[][] = [];
    const firstBarItem = bar.items[0][0];
    const numberOfColumns = this.calculateNumberOfBarColumns(note, bar);
    for (let i = 0; i < numberOfColumns; i++) {
      barItems.push([])
      for (let j = 0; j < TabInterface.NUMBER_OF_LINES; j++) {
        barItems[i][j] = this.createBarItem(note, i, firstBarItem, j)
      }
    }

    bar.items = barItems;
    return bar;
  }

  private modifyBarColumn(barItem: BarItem[], note: NoteEnum): BarItem[] {
    return barItem.map((barItem: BarItem) => ({
      ...barItem,
      note: {
        type: note,
        width: GetNoteWidth(note)
      }
    }))
  }

  private calculateNumberOfBarColumns(note: NoteEnum, bar: Bar): number {
      const timeSignature: TimeSignature = bar.timeSignature;
      const minimalNoteLength = timeSignature.numerator / timeSignature.denominator;
      const assignedNoteLength = 1 / Number(note);

      if (minimalNoteLength >= assignedNoteLength) {
        return minimalNoteLength / assignedNoteLength;
      }

      return 0;
  }

  private createBarItem(note: NoteEnum, xIndex: number, firstBarItem: BarItem, stringNumber: number): BarItem {
    const previousXPosition = firstBarItem.x;
    const noteWidth = GetNoteWidth(note)
    return {
      x: TabInterface.PADDING + (previousXPosition +(xIndex * noteWidth)),
      y: TabInterface.SPACE_BETWEEN_LINES + (TabInterface.SPACE_BETWEEN_LINES * stringNumber),
      stringNumber: stringNumber,
      xIndex,
      note: {
        type: note,
        width: noteWidth
      },
      tabObject: {
        type: TabObjectType.Note,
      }
    }
  }

  private insertPause(note: NoteEnum) {
    if (!this.highlight$) {
      return;
    }

    const {rowNumber, columnNumber, barNumber} = this.highlight$;

    const newTabulation = DeepCopy(this.tabulation$);

    newTabulation[rowNumber].bars[barNumber].items[columnNumber] = this.assertPauseInColumn(newTabulation[rowNumber].bars[barNumber], columnNumber, note);

    this.tabulatureService.updateTabulation(newTabulation)
  }

  private assertPauseInColumn(bar: Bar, columnNumber: number, note: NoteEnum): BarItem[] {
    return bar.items[columnNumber].map((barItem)=> {
      return {
        ...barItem,
        note: {
          type: note,
          width: GetNoteWidth(note)
        },
        tabObject: {
          type: TabObjectType.Pause,
        }
      }
    });
  }

}
