import {MenuItem} from "primeng/api";
import {ContextMenuService} from "../services/context-menu.service";
import {TabObjectType} from "../enums/tab-object-type.enum";
import {NoteEnum} from "../enums/note.enum";


export function getContextMenuItems(contextMenuService: ContextMenuService): MenuItem[] {
  return [
    {
      label: '1/1',
      icon: "whole-svg-icon",
      command: () => contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.WHOLE_NOTE),
    },
    {
      label: '1/2',
      icon: "half-svg-icon",
      command: () => contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.HALF_NOTE),
    },
    {
      label: '1/4',
      icon: "quarter-svg-icon",
      command: () => contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.QUARTER_NOTE),
    },
    {
      label: '1/8',
      icon: "eighth-svg-icon",
      command: () => contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.EIGHTH_NOTE),
    },
    {
      label: '1/16',
      icon: "sixteenth-svg-icon",
      command: () => contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.SIXTEENTH_NOTE),
    },
    {
      label: '1/32',
      icon: "thirty-second-svg-icon",
      command: () => contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.THIRTY_SECOND_NOTE),
    },
    {
      label: '1/1',
      icon: "whole-pause-svg-icon",
      command: () => contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.WHOLE_NOTE),
    },
    {
      label: '1/2',
      icon: "half-pause-svg-icon",
      command: () => contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.HALF_NOTE),
    },
    {
      label: '1/4',
      icon: "quarter-pause-svg-icon",
      command: () => contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.QUARTER_NOTE),
    },
    {
      label: '1/8',
      icon: "eighth-pause-svg-icon",
      command: () => contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.EIGHTH_NOTE),
    },
    {
      label: '1/16',
      icon: "sixteenth-pause-svg-icon",
      command: () => contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.SIXTEENTH_NOTE),
    },
    {
      label: '1/32',
      icon: "thirty-second-pause-svg-icon",
      command: () => contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.THIRTY_SECOND_NOTE),
    },
    {
      label: 'Arpeggio',
      icon: "arpeggio-up-svg-icon",
    },
    {
      label: 'Arpeggio Down',
      icon: "arpeggio-down-svg-icon",
    },
    {
      label: 'Bend',
      icon: "bend-svg-icon",
    },
    {
      label: 'Chord',
      icon: "chord-svg-icon",
    },
    {
      label: 'Down Stroke',
      icon: "down-stroke-svg-icon",
    },
    {
      label: 'Hammer/Pull Off',
      icon: "hammer-pull-off-svg-icon",
    },
    {
      label: 'Harmonic',
      icon: "harmonic-svg-icon",
    },
    {
      label: 'Legato Slide',
      icon: "legato-slide-svg-icon",
    },
    {
      label: 'Let Ring',
      icon: "let-ring-svg-icon",
    },
    {
      label: 'Move Note Down',
      icon: "move-note-down-svg-icon",
    },
    {
      label: 'Palm Mute',
      icon: "palm-mute-svg-icon",
    },
    {
      label: 'Pop',
      icon: "pop-svg-icon",
    },
    {
      label: 'Slap',
      icon: "slap-svg-icon",
    },
    {
      label: 'Slide',
      icon: "slide-svg-icon",
    },
    {
      label: 'Slide In Above',
      icon: "slide-in-above-svg-icon"
    },
    {
      label: 'Slide In Below',
      icon: "slide-in-below-svg-icon"
    },
    {
      label: 'Slide Out Down',
      icon: "slide-out-down-svg-icon"
    },
    {
      label: 'Slide Out Up',
      icon: "slide-out-up-svg-icon"
    },
    {
      label: 'Slight Vibrato',
      icon: "slight-vibrato-svg-icon"
    },
    {
      label: 'Stroke Up',
      icon: "stroke-up-svg-icon"
    },
    {
      label: 'Tap',
      icon: "tap-svg-icon",
    },
    {
      label: 'Tie To Previous Bit',
      icon: "tie-to-previous-svg-icon"
    }
  ];
}
