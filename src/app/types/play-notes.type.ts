import {BarItem} from "./bar-item.type";
import {TimeSignature} from "./time-signature.type";

export type PlayNotes = {
  notes: BarItem[][];
  timeSignature: TimeSignature;
  rowIndex: number;
  barIndex: number;
}
