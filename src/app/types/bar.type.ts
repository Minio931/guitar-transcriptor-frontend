import {BarItem} from "./bar-item.type";
import {TimeSignature} from "./time-signature.type";

export type Bar = {
  id: number;
  row: number;
  items: BarItem[][];
  timeSignature: TimeSignature;
  tempo: number;
  repeatStarts: boolean;
  repeatEnds: boolean;
}
