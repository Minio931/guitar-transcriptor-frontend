import {Position} from "./position.type";

export type HighlightPosition = Position & {
  rowNumber: number;
  columnNumber: number;
  stringNumber: number;
  barNumber: number;
}
