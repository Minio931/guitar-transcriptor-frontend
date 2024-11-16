import {Position} from "./position.type";
import {TabObjectItem} from "./tab-object-item.type";
import {Note} from "./note.type";

export type BarItem = Position& {
  stringNumber?: number;
  xIndex?: number;
  tabObject?: TabObjectItem;
  note?: Note;
}
