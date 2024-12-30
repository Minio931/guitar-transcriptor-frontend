import {TabInterface} from "../configs/tab-interface.config";
import {NoteEnum} from "../enums/note.enum";


export function GetNoteWidth(note: NoteEnum): number {
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
    case NoteEnum.SIXTY_FOURTH_NOTE:
      return TabInterface.durationSixtyFourLength
  }
}
