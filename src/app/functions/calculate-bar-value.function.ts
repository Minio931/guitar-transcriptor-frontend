import {Bar} from "../types/bar.type";
import {TimeSignature} from "../types/time-signature.type";
import {BarItem} from "../types/bar-item.type";
import {TabObjectType} from "../enums/tab-object-type.enum";


export function CalculateBarValue(bar: Bar) {
  return bar.items.reduce((acc: number, curr: BarItem[]) =>
    acc + ((curr[0].tabObject && curr[0]?.tabObject.type === TabObjectType.Note ||
    curr[0].tabObject && curr[0]?.tabObject.type === TabObjectType.Pause)
    ? 1/Number(curr[0]?.note?.type)
      : 0), 0);
}
