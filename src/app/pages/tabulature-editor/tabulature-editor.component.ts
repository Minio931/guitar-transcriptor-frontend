import {
  afterNextRender,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild
} from "@angular/core";
import {StaffItemComponent} from "./_components/staff-item/staff-item.component";
import {TabulatureService} from "../../services/tabulature.service";
import {TabItem} from "../../types/tab-item.type";
import {TabObjectItem} from "../../types/tab-object-item.type";
import {TabInterface} from "../../configs/tab-interface.config";
import {HiglightItemPosition} from "../../types/higlight-item-position.type";
import {TabulationGridItem} from "../../types/tabulation-grid-item.type";
import {ArrowKey} from "../../types/arrow-key.type";
import {ArrowKeyEnum} from "../../enums/arrow-key.enum";
import {TimeSignature} from "../../types/time-signature.type";

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
  protected readonly TabInterface = TabInterface
  readonly width = signal<string>("100%");
  readonly height = signal<string>("200px");

  set containerWidth(width: number) {
    this.tabulatureService.containerWidth.set(width);
  }

  set tabLines(linesPath: string) {
    this.tabulatureService.tabLines.set(linesPath)
  }

  get tabLines(): string {
    return this.tabulatureService.tabLines();
  }

  get tabItemsPositions(): TabItem[] {
    return this.tabulatureService.tabItemsPositions();
  }

  get activeGuitarTuning(): string[] {
    return this.tabulatureService.activeGuitarTuning();
  }

  get highlightedItemPosition(): HiglightItemPosition {
    return this.tabulatureService.highlightedItemPosition();
  }

  get tabObject():TabObjectItem[] {
    return this.tabulatureService.tabObject();
  }

  get spaceBetweenItems(): number {
    return this.tabulatureService.spaceBetweenItems();
  }

  get SPACE_BETWEEN_LINES(): number {
    return this.tabulatureService.SPACE_BETWEEN_LINES;
  }

  get highlightedTabulationGridItem(): TabulationGridItem | null {
    return this.tabulatureService.highlightedTabulationGridItem();
  }

  get timeSignature(): TimeSignature {
    return this.tabulatureService.timeSignature();
  }

  set barLines(barLines: string) {
    this.tabulatureService.barLines.set(barLines)
  }

  get barLines(): string {
    return this.tabulatureService.barLines();
  }

  tabulatureService: TabulatureService = inject(TabulatureService);

  @ViewChild("staffElement") staffElement!: ElementRef;

  constructor(elementRef: ElementRef) {
    afterNextRender(() => {
      window.addEventListener("resize", () => {
        this.initializeTabulature(elementRef);
      });
      this.initializeTabulature(elementRef);
    })
  }

  private initializeTabulature(elementRef: ElementRef) {
    this.containerWidth = elementRef.nativeElement.offsetWidth;
    this.tabLines = this.tabulatureService.generateTabLines();
    this.barLines = this.tabulatureService.generateBarLines();
    this.tabulatureService.generateTabulationGrid();
    this.tabulatureService.generateTabItemsPositions();
  }

  @HostListener("window:keydown", ["$event"])
  public handleKeyDown(event: KeyboardEvent) {
    if (event.key in ArrowKeyEnum) {
      this.tabulatureService.highlightNearestItem(event.key as ArrowKey)
    }
    if (this.highlightedTabulationGridItem) {
      this.tabulatureService.insertTabItem(event.key, this.highlightedTabulationGridItem?.x, this.highlightedTabulationGridItem?.stringNumber);
      this.tabulatureService.generateTabItemsPositions()
    }
  }

  public highlightSpotOnStaff(event: MouseEvent) {
      const elementBoundingRect: DOMRect = this.staffElement.nativeElement.getBoundingClientRect();
      const x: number = event.clientX - elementBoundingRect.left;
      const y: number = event.clientY - elementBoundingRect.top;

      this.tabulatureService.findSpotToHighlight({x, y})
  }


}
