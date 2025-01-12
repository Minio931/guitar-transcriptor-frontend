import {Row} from "../types/row.type";
import {Bar} from "../types/bar.type";
import {BarPosition} from "../types/bar-position.type";


export function FindEveryBarPartIndexes(barId: number, tabulation: Row[]) : BarPosition[] {
  const indexes: BarPosition[] = [];
  tabulation.forEach((row: Row, rowIndex: number) => {
    row.bars.forEach((bar: Bar, barIndex: number) => {
      if (bar.id === barId) {
        indexes.push({
          rowIndex,
          barIndex
        });
      }
    })
  })

  return indexes;
}
