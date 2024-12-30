import {Bar} from "./bar.type";
import {RenderableItem} from "./renderable-item.type";

export type Row = {
  id: number;
  bars: Bar[];
  path: string;
  additionalItems?: RenderableItem[];
}
