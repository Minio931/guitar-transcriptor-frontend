import {GetOneItemPerColumn} from "./get-one-item-per-column.function";
import {Bar} from "../types/bar.type";
import {GetColumnItemWidthFunction} from "./get-column-item-width.function";
import {TabInterface} from "../configs/tab-interface.config";
import {TabObjectType} from "../enums/tab-object-type.enum";


export function CalculatePositionX(previousBarsWidth: number, columnIndex: number, bar: Bar): number {
  const itemsBefore = bar.items.slice(0, columnIndex);


  const widthItemsBefore = GetOneItemPerColumn(itemsBefore).reduce((acc, curr) => {
    const width = GetColumnItemWidthFunction(curr?.tabObject?.type, curr?.note?.type);
    return acc + width;
  }, 0);

  return TabInterface.PADDING + previousBarsWidth + widthItemsBefore;
}
