import {Position} from "./position.type";
import {TabObjectItem} from "./tab-object-item.type";
import {Note} from "./note.type";

export type BarItem = Position& {
  stringNumber?: number;
  xIndex?: number;
  tabObject?: TabObjectItem;
  note?: Note;
  strokeDown?: boolean;
  strokeUp?: boolean;
  arpeggioUp?: boolean;
  arpeggioDown?: boolean;
  slideInAbove?: boolean;
  slideInBelow?: boolean;
  slideOutDown?: boolean;
  slideOutUp?: boolean;
  hammerPullOff?: boolean;
  harmonic?: boolean;
  legatoSlide?: boolean;
  letRing?: boolean;
  moveNoteDown?: boolean;
  palmMute?: boolean;
  pop?: boolean;
  slap?: boolean;
  slide?: boolean;
  slightVibrato?: boolean;
  tieToPreviousBit?: boolean;
}
