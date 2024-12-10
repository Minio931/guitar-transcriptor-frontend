import {TabObjectType} from "../enums/tab-object-type.enum";
import {NoteEnum} from "../enums/note.enum";
import {GetNoteWidth} from "./get-note-width.function";
import {TabInterface} from "../configs/tab-interface.config";


export function GetColumnItemWidthFunction(type?: TabObjectType, note?: NoteEnum) {
  switch (type) {
    case TabObjectType.Note:
      return GetNoteWidth(note!);
    case TabObjectType.TimeSignature:
      return TabInterface.timeSignatureLength;
    default:
      return 0;
  }
}
