import {
  Component,
  computed, effect,
  ElementRef,
  inject,
  input, OnInit, Renderer2,
  Signal,
  signal,
  ViewChild,
  ViewEncapsulation
} from "@angular/core";
import {Bar} from "../../../../types/bar.type";
import {TabInterface} from "../../../../configs/tab-interface.config";
import {TabulatureService} from "../../../../services/tabulature.service";
import {HighlightPosition} from "../../../../types/highlight-position.type";
import {BarItem} from "../../../../types/bar-item.type";
import {ContextMenuComponent} from "../context-menu/context-menu.component";
import {HighlightService} from "../../../../services/highlight.service";
import {TabRenderService} from "../../../../services/tab-render.service";
import {BarError} from "../../../../types/bar-error.type";
import {Tooltip} from "primeng/tooltip";
import {Popover} from "primeng/popover";
import {MenuItem} from "primeng/api";
import {getBarMenuConfig} from "../../../../configs/bar-menu.config";
import {ContextMenuService} from "../../../../services/context-menu.service";
import {CustomMenuItem} from "../../../../types/custom-menu-item.type";
import {RenderableElements} from "../../../../configs/renderable-elements.config";
import {RenderableItem} from "../../../../types/renderable-item.type";
import {TabulatureEditorService} from "../../tabulature-editor.service";

const INITIAL_HIGHLIGHT_POSITION: HighlightPosition = {
  x: -100,
  y: 0,
  rowNumber: 0,
  columnNumber: 0,
  stringNumber: 0,
  barNumber: 0
}

@Component({
  selector: "app-tabulature-row",
  templateUrl: "./tabulature-row.component.html",
  styleUrl: "./tabulature-row.component.scss",
  imports: [
    ContextMenuComponent,
    Tooltip,
    Popover
  ],
  standalone: true,
  encapsulation: ViewEncapsulation.None
})
export class TabulatureRowComponent implements OnInit{
  protected readonly TabInterface = TabInterface;

  rowWidth = input.required<string>();

  rowHeight = input.required<string>();

  rowBars = input.required<Bar[]>();

  rowPath = input.required<string>();

  rowNumber = input.required<number>();

  rowErrors = input.required<BarError[]>();

  rowAdditionalItems = input.required<RenderableItem[]>();

  barItems = computed<BarItem[]>(() => {
    return this.rowBars().flatMap((bar: Bar) => {
      return bar.items.flat(Infinity) as BarItem[]
    })
  })

  tabulationRowId = computed(() => `staff-lines-${this.rowNumber()}`);

  lengthOfBar = computed<number>(() => this.tabRenderService.previousBarsWidth(this.highlightPosition().barNumber + 1, this.rowBars()));

  highlightPosition = computed<HighlightPosition>(() => {
    return (this.highlight?.rowNumber ?? -1) === this.rowNumber() ? this.highlight as HighlightPosition : INITIAL_HIGHLIGHT_POSITION;
  });

  rowHighlighted = computed<boolean>(() => {
    return this.highlightPosition() !== INITIAL_HIGHLIGHT_POSITION;
  });

  tabulatureService: TabulatureService = inject(TabulatureService);
  tabRenderService: TabRenderService = inject(TabRenderService);
  contextMenuService: ContextMenuService = inject(ContextMenuService);

  barMenuItems: CustomMenuItem[] = getBarMenuConfig(this.contextMenuService);

  @ViewChild('rowElement') rowElement!: ElementRef;

  constructor(private renderer: Renderer2, private el: ElementRef) {
    effect(() => this.renderRowAdditionalItems(this.rowAdditionalItems()));
  }

  ngOnInit(): void {
    this.renderRowAdditionalItems(this.rowAdditionalItems());
  }

  get highlight(): HighlightPosition | null {
    return this.tabulatureService.highlight$;
  }


  public renderRowAdditionalItems(additionalItems: RenderableItem[]): void {
    const container = this.el.nativeElement.querySelector('.additionalItemsContainer');
    const svgNS = 'http://www.w3.org/2000/svg';

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    additionalItems.forEach((item: RenderableItem) => {
      const imageElement = document.createElementNS(svgNS, item.tag);
      Object.entries(item.attributes).forEach(([key, value]) => {
        imageElement.setAttribute(key, value.toString());
      });
      container.appendChild(imageElement);
    });
  }

  public errorForBar(index: number): BarError | null {
    return this.rowErrors().find(error => error.barIndex === index) ?? null;
  }

  adjustTooltipPosition(event: MouseEvent) {
    setTimeout(() => {
      const tooltipElement: HTMLElement | null = document.querySelector('.p-tooltip');
      const arrowElement: HTMLElement | null = document.querySelector('.p-tooltip-arrow');
      if (tooltipElement) {
        if (arrowElement) {
          arrowElement.style.display = 'none';
        }
        tooltipElement.style.left = `${event.clientX}px`;
        tooltipElement.style.top = `${event.clientY}px`;
      }
    }, 0);
  }

  public highlightSpotOnStaff(event: MouseEvent) {
    const elementBoundingRect: DOMRect = this.rowElement.nativeElement.getBoundingClientRect();
    const x: number = event.clientX - elementBoundingRect.left;
    const y: number = event.clientY - elementBoundingRect.top;

    this.tabulatureService.findSpotToHighlight({x, y}, this.rowNumber())
  }

  public adjustHighlightRectangle(): number {
    const { barNumber, stringNumber, columnNumber}  = this.highlightPosition();

    const barItem = this.rowBars()[barNumber]?.items[columnNumber][stringNumber - 1];

    if (!!barItem?.tabObject?.fretNumber && barItem?.tabObject?.fretNumber > 9) {
      return TabInterface.FONT_SIZE / 2.5
    } else {
      return  TabInterface.FONT_SIZE / 2
    }

  }
}

