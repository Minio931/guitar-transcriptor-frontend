import {Bar} from "../types/bar.type";
import {Row} from "../types/row.type";
import {BarItem} from "../types/bar-item.type";


export function FindBarPosition(tabulation: Row[], barItems: BarItem[][]): { rowIndex: number; barIndex: number }  {
  const rowIndex = tabulation.findIndex(row => row.bars.some(bar => JSON.stringify(bar.items) === JSON.stringify(barItems)));

  if (rowIndex === -1) {
    return {
      rowIndex: tabulation.length - 1,
      barIndex: tabulation[tabulation.length - 1].bars.length - 1
    }
  }

  const barIndex = tabulation[rowIndex].bars.findIndex(bar => JSON.stringify(bar.items) === JSON.stringify(barItems));

  return {
    rowIndex,
    barIndex
  }
}
