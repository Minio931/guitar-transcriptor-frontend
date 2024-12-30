import {Bar} from "../types/bar.type";
import {TimeSignature} from "../types/time-signature.type";
import {BarItem} from "../types/bar-item.type";


export function CalculateBarValue(bar: Bar) {
  return bar.items.reduce((acc: number, curr: BarItem[]) => acc + 1/Number(curr[0]?.note?.type), 0);
}
