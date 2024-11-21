import {
  AfterViewInit,
  Component, ComponentFactoryResolver,
  input,
  QueryList,
  ViewChildren,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import { ContextMenu } from "primeng/contextmenu";
import { Button } from "primeng/button";
import {MenuItem} from "primeng/api";
import {EighthNoteSvgComponent} from "../../../../assets/eighth-note-svg.component";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [
    CommonModule,
    Button,
    ContextMenu,
    EighthNoteSvgComponent
  ],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ContextMenuComponent implements  AfterViewInit{

  menuTarget = input.required<string | HTMLElement>();

  @ViewChildren('iconContainer', {read: ViewContainerRef})
  iconContainers!: QueryList<ViewContainerRef>


  ngAfterViewInit() {
    console.log(this.menuTarget(), "asdasdas")
  }

  menuItems: MenuItem[] = [
    {
      label: '',
      icon: "eighth-note",
      command: () => console.log('Guitar Transcriptor'),
    },
    {
      label: '',
      icon: "eighth-note",
      command: () => console.log('Guitar Transcriptor'),
    },
    {
      label: '',
      icon: "eighth-note",
      command: () => console.log('Guitar Transcriptor'),
    },
    {
      label: '',
      icon: "eighth-note",
      command: () => console.log('Guitar Transcriptor'),
    },
    {
      label: '',
      icon: "eighth-note",
      command: () => console.log('Guitar Transcriptor'),
    },
    {
      label: '',
      icon: "eighth-note",
      command: () => console.log('Guitar Transcriptor'),
    },
    {
      label: '',
      icon: "eighth-note",
      command: () => console.log('Guitar Transcriptor'),
    },
  ]

  getIconComponent(iconName: string) {
    console.log(iconName);
    switch (iconName){
      case 'eighth-note':
        return EighthNoteSvgComponent;
      default:
        return EighthNoteSvgComponent
    }
  }

  loadIcons() {
    this.iconContainers.forEach((container, index) => {
      container.clear();
      const iconName = this.menuItems[index].icon!;
      const iconComponent = this.getIconComponent(iconName);
      container.createComponent(iconComponent);
    })
  }

}
