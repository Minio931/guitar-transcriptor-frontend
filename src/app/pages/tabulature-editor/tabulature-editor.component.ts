import {afterNextRender, afterRender, Component, ElementRef, HostListener, signal, ViewChild} from "@angular/core";
import {StaffItem} from "../../interfaces/staff.interface";
import {StaffItemComponent} from "./_components/staff-item/staff-item.component";
import {DUMMY_DATA} from "../../configs/dummy-tab.config";
import {TabItem} from "../../interfaces/tab-item.interface";
import {TabulationGridItem} from "../../interfaces/tabulation-grid-item.interface";
import {HiglightItemPosition} from "../../interfaces/higlight-item-position.interface";
import {Regex} from "../../configs/regex.config";

const NUMBER_OF_LINES: number = 6;
const INITIAL_HIGHLIGHT_POSITION: HiglightItemPosition = {x: -100, y: 0};

@Component({
  selector: "app-tabulature-editor",
  standalone: true,
  templateUrl: "./tabulature-editor.component.html",
  imports: [
    StaffItemComponent
  ],
  styleUrl: "./tabulature-editor.component.scss"
})
export class TabulatureEditorComponent {
  readonly SPACE_BETWEEN_LINES: number = 25;
  readonly SPACE_BETWEEN_ITEMS: number = 50;
  readonly FONT_SIZE: number = 16;
  readonly STROKE_WIDTH: number = 2;
  readonly PADDING: number = 50;
  readonly width = signal<string>("100%");
  readonly height = signal<string>("200px");
  staffObject = signal<StaffItem[]>(DUMMY_DATA);
  staffLines = signal<string>("");
  guitarTunning = signal<string[]>(["E", "A", "D", "G", "B", "E"]);
  containerWidth = signal<number>(0);
  tabItemsPositions = signal<TabItem[]>([]);
  tabulationGrid = signal<TabulationGridItem[]>([]);
  highlightedTabulationGridItem = signal<TabulationGridItem | null>(null);
  highlightedGridItem = signal<HiglightItemPosition>(INITIAL_HIGHLIGHT_POSITION);
  @ViewChild("staffElement") staffElement!: ElementRef;

  constructor(elementRef: ElementRef) {
    afterNextRender(() => {
      window.addEventListener("resize", () => {
        this.initializeStaff(elementRef);
      });
      this.initializeStaff(elementRef);
    })
  }

  @HostListener("window:keydown", ["$event"])
  public addItemToTabulation(event: KeyboardEvent) {
    if (Regex.isNumber.test(event.key) && this.highlightedGridItem().x !== INITIAL_HIGHLIGHT_POSITION.x && this.highlightedTabulationGridItem() !== null) {
      const xPosition: number = (this.highlightedTabulationGridItem()!.x / this.SPACE_BETWEEN_ITEMS) - 1;
      this.staffObject.set([...this.staffObject(),
        {
          positionX: xPosition,
          stringNumber: this.highlightedTabulationGridItem()!.stringNumber,
          fretNumber: Number(event.key)
        }]);
      this.generateStaffItemPositions()
    }
  }

  private initializeStaff(elementRef: ElementRef): void {
    this.containerWidth.set(elementRef.nativeElement.querySelector("svg").clientWidth - this.PADDING);
    this.staffLines.set(this.generateStaff());
    this.generateStaffItemPositions();
    this.generateTabulationGrid();
  }

  private generateStaff(): string {
    const staffLines: string[] = [];
    for (let i = 1; i <= NUMBER_OF_LINES; i++) {
      const x1: number = this.PADDING;
      const x2: number = this.containerWidth();
      const y1: number = i * this.SPACE_BETWEEN_LINES;
      staffLines.push(this.generateStaffLine(x1, x2, y1, y1));
    }

    return staffLines.join(" ");
  }

  private generateStaffLine(x1: number, x2: number, y1: number, y2: number): string {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  private generateStaffItemPositions() {
    this.staffObject().forEach((item: StaffItem) => {
      const positionX: number = this.PADDING + (item.positionX * this.SPACE_BETWEEN_ITEMS);
      const positionY: number = (this.SPACE_BETWEEN_LINES * item.stringNumber) + ((this.FONT_SIZE / 2) - this.STROKE_WIDTH);
      this.tabItemsPositions.set([...this.tabItemsPositions(), {positionX, positionY, fretNumber: item.fretNumber}]);
    })
  }

  private generateTabulationGrid(){
    const numberOfElementsOnTab: number = Math.floor(this.containerWidth() / this.SPACE_BETWEEN_ITEMS);
    for (let i: number = 0; i < numberOfElementsOnTab; i++) {
      for (let j: number = 1; j <= NUMBER_OF_LINES; j++) {
        const x: number = this.PADDING + (i * this.SPACE_BETWEEN_ITEMS);
        const y: number = (this.SPACE_BETWEEN_LINES * j);
        this.tabulationGrid.set([...this.tabulationGrid(), {x, y, stringNumber: j}]);
      }
    }
  }

  private isItemNearMouse(itemX: number, itemY: number, mouseX: number, mouseY: number): boolean {
    const buffer: number = 10;
    return itemX < (mouseX + this.SPACE_BETWEEN_ITEMS + buffer)
        && itemX > (mouseX - this.SPACE_BETWEEN_ITEMS - buffer)
        && itemY < (mouseY + this.SPACE_BETWEEN_LINES + buffer)
        && itemY > (mouseY - this.SPACE_BETWEEN_LINES - buffer);
  }

  public highlightSpotOnStaff(event: MouseEvent) {
      const elementBoundingRect: DOMRect = this.staffElement.nativeElement.getBoundingClientRect();
      const x: number = event.clientX - elementBoundingRect.left;
      const y: number = event.clientY - elementBoundingRect.top;

      const nearestGridItems: TabulationGridItem[] = [];

      this.tabulationGrid().forEach((item: TabulationGridItem) => {
        if (this.isItemNearMouse(item.x, item.y, x, y)) {
          nearestGridItems.push(item);
        }
      })

      nearestGridItems.sort((a: TabulationGridItem, b: TabulationGridItem) => {
        return (Math.pow((x - a.x), 2) + Math.pow((a.y - y), 2)) - (Math.pow((x - b.x), 2) + Math.pow((b.y - y), 2));
      });

      const nearestGridItem: TabulationGridItem = nearestGridItems[0];
      const shiftToCenter: number = (this.FONT_SIZE + (this.FONT_SIZE / 2)) / 2;
      this.highlightedGridItem.set({
        x: nearestGridItem.x - shiftToCenter + this.FONT_SIZE / 4,
        y: nearestGridItem.y - shiftToCenter
      });
      this.highlightedTabulationGridItem.set(nearestGridItem);
  }



}
