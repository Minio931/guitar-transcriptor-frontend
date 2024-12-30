import {BarItem} from "./bar-item.type";
import {TimeSignature} from "./time-signature.type";

export type Bar = {
  id: number;
  row: number;
  items: BarItem[][];
  timeSignature: TimeSignature;
  tempo: number;
  divided: boolean;
  repeatStarts: boolean;
  repeatEnds: boolean;
}
