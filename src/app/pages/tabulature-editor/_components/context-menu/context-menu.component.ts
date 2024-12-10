import {Component, inject, input, QueryList, ViewChildren, ViewContainerRef, ViewEncapsulation} from '@angular/core';
import {ContextMenu} from "primeng/contextmenu";
import {Button} from "primeng/button";
import {MenuItem} from "primeng/api";
import {EighthNoteSvgComponent} from "../../../../assets/eighth-note-svg.component";
import {CommonModule} from "@angular/common";
import {Tooltip} from "primeng/tooltip";
import {ContextMenuService} from "../../../../services/context-menu.service";
import {TabObjectType} from "../../../../enums/tab-object-type.enum";
import {NoteEnum} from "../../../../enums/note.enum";

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [
    CommonModule,
    Button,
    ContextMenu,
    EighthNoteSvgComponent,
    Tooltip
  ],
  providers: [
    ContextMenuService,
  ],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ContextMenuComponent {

  menuTarget = input.required<string | HTMLElement>();

  contextMenuService: ContextMenuService = inject(ContextMenuService)

  @ViewChildren('iconContainer', {read: ViewContainerRef})
  iconContainers!: QueryList<ViewContainerRef>


  menuItems: MenuItem[] = [
    {
      label: '1/1',
      icon: "eighth-svg-icon",
      command: () => this.contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.WHOLE_NOTE),
    },
    {
      label: '1/2',
      icon: "eighth-svg-icon",
      command: () => this.contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.HALF_NOTE),
    },
    {
      label: '1/4',
      icon: "eighth-svg-icon",
      command: () => this.contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.QUARTER_NOTE),
    },
    {
      label: '1/8',
      icon: "eighth-svg-icon",
      command: () => this.contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.EIGHTH_NOTE),
    },
    {
      label: '1/16',
      icon: "eighth-svg-icon",
      command: () => this.contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.SIXTEENTH_NOTE),
    },
    {
      label: '1/32',
      icon: "eighth-svg-icon",
      command: () => this.contextMenuService.tabContextAction(TabObjectType.Note, NoteEnum.THIRTY_SECOND_NOTE),
    },

  ]

}
