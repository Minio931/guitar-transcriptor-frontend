import {Component, inject, input, QueryList, ViewChildren, ViewContainerRef, ViewEncapsulation} from '@angular/core';
import {ContextMenu} from "primeng/contextmenu";
import {Button} from "primeng/button";
import {MenuItem} from "primeng/api";
import {CommonModule} from "@angular/common";
import {Tooltip} from "primeng/tooltip";
import {ContextMenuService} from "../../../../services/context-menu.service";
import {getContextMenuItems} from "../../../../configs/context-menu.config";

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [
    CommonModule,
    Button,
    ContextMenu,
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


  menuItems: MenuItem[] = getContextMenuItems(this.contextMenuService);

}
