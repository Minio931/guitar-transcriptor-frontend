import {Row} from "../types/row.type";
import {DeepCopy} from "./deep-copy.function";
import {Bar} from "../types/bar.type";


export function ExtractBarsToPosition(rowIndex: number, barIndex: number, tabulation: Row[]): Bar[] {
    const bar = tabulation[rowIndex].bars[barIndex];
    const tabulationCopy = DeepCopy(tabulation);
    const bars = tabulationCopy.flatMap(row => row.bars);

    return bars.slice(0, bars.findIndex((barItem: Bar) => barItem.id === bar.id) + 1);
}
