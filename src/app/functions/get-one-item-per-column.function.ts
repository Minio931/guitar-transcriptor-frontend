import {BarItem} from "../types/bar-item.type";

export function GetOneItemPerColumn(items: BarItem[][]): BarItem[] {
  return items.map((column: BarItem[]) => column.slice(0, 1)).flat(Infinity) as BarItem[]
}
