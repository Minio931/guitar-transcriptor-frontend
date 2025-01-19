import {NoteEnum} from "../enums/note.enum";
import {Note} from "../types/note.type";

export function ConvertResponseDurationToEnum(duration_name: string): NoteEnum {
  switch (duration_name) {
    case 'whole_note':
      return NoteEnum.WHOLE_NOTE;
    case 'half_note':
      return NoteEnum.HALF_NOTE;
    case 'quarter_note':
      return NoteEnum.QUARTER_NOTE;
    case 'eighth_note':
      return NoteEnum.EIGHTH_NOTE;
    case 'sixteenth_note':
      return NoteEnum.SIXTEENTH_NOTE;
    case 'thirty_second_note':
      return NoteEnum.THIRTY_SECOND_NOTE;
    case 'sixty_fourth_note':
      return NoteEnum.SIXTY_FOURTH_NOTE;
    default:
      return NoteEnum.QUARTER_NOTE;
  }
}
