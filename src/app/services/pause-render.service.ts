import {Injectable, Renderer2} from "@angular/core";
import {Bar} from "../types/bar.type";
import {RenderableElements} from "../configs/renderable-elements.config";
import {GetOneItemPerColumn} from "../functions/get-one-item-per-column.function";
import {BarItem} from "../types/bar-item.type";
import {TabObjectType} from "../enums/tab-object-type.enum";
import {CalculatePositionX} from "../functions/calculate-position-x.function";
import {TabInterface} from "../configs/tab-interface.config";
import {GetNoteWidth} from "../functions/get-note-width.function";
import {NoteEnum} from "../enums/note.enum";
import {RenderableItem} from "../types/renderable-item.type";


@Injectable({providedIn: "root"})
export class PauseRenderService {

  public renderPauseElements(bar: Bar, index: number, bars: Bar[], previousBarWidth: number): RenderableItem[] {
    const pauseElements: RenderableItem[] = [];

    GetOneItemPerColumn(bar.items).forEach((item: BarItem, columnIndex: number) => {
      if (item?.tabObject?.type === TabObjectType.Pause) {
        pauseElements.push(this.renderPauseElement(bar, columnIndex, previousBarWidth, item!.note!.type))
      }
    });

    return pauseElements;
  }

  private renderPauseElement(bar: Bar, columnIndex: number, previousBarWidth: number, note: NoteEnum): RenderableItem {
    const x = CalculatePositionX(previousBarWidth, columnIndex, bar) - TabInterface.PAUSE_LENGTH / 2.5;
    const y = TabInterface.SPACE_BETWEEN_LINES * 2;
    const width = TabInterface.PAUSE_LENGTH;
    const height = TabInterface.SPACE_BETWEEN_LINES  * 3.5;

    return this.generatePauseElement(x, y, width, height, note);
  }

  private generatePauseElement(x: number, y: number, width: number, height: number, note: NoteEnum): RenderableItem {
    const pausePath = this.getPauseElement(note);

    return {
      tag: "image",
      attributes: {
        href: pausePath,
        x,
        y,
        width,
        height
      }
    }
  }

  private getPauseElement(note: NoteEnum): string {
    switch (note) {
      case NoteEnum.WHOLE_NOTE:
        return RenderableElements.wholePath;
      case NoteEnum.HALF_NOTE:
        return RenderableElements.halfPath;
      case NoteEnum.QUARTER_NOTE:
        return RenderableElements.quarterPath;
      case NoteEnum.EIGHTH_NOTE:
        return RenderableElements.eighthPath;
      case NoteEnum.SIXTEENTH_NOTE:
        return RenderableElements.sixteenthPath;
      case NoteEnum.THIRTY_SECOND_NOTE:
        return RenderableElements.thirtySecondPath;
      default:
        return RenderableElements.quarterPath
    }
  }
}
