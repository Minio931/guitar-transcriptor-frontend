import {
  afterNextRender, AfterViewInit, ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild
} from "@angular/core";
import {TabulatureService} from "../../services/tabulature.service";
import {TabObjectItem} from "../../types/tab-object-item.type";
import {TabInterface} from "../../configs/tab-interface.config";
import {HiglightItemPosition} from "../../types/higlight-item-position.type";
import {ArrowKey} from "../../types/arrow-key.type";
import {ArrowKeyEnum} from "../../enums/arrow-key.enum";
import {TimeSignature} from "../../types/time-signature.type";
import {Bar} from "../../types/bar.type";
import {TabulatureRowComponent} from "./_components/tabulature-row/tabulature-row.component";
import {Row} from "../../types/row.type";
import {ChangeDetection} from "@angular/cli/lib/config/workspace-schema";

@Component({
  selector: "app-tabulature-editor",
  standalone: true,
  imports: [
    TabulatureRowComponent
  ],
  templateUrl: "./tabulature-editor.component.html",
  styleUrl: "./tabulature-editor.component.scss"
})
export class TabulatureEditorComponent implements AfterViewInit{
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

  get activeGuitarTuning(): string[] {
    return this.tabulatureService.activeGuitarTuning();
  }

  get highlightedItemPosition(): HiglightItemPosition {
    return this.tabulatureService.highlightedItemPosition();
  }

  get SPACE_BETWEEN_LINES(): number {
    return this.tabulatureService.SPACE_BETWEEN_LINES;
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

  get tabRow(): string[] {
    return this.tabulatureService.tabulationPaths();
  }

  get tabulation(): Row[] {
    return this.tabulatureService.tabulation();
  }

  // get tabulationGrid(): TabulationGridItem[] {
  //   return this.tabulatureService.tabulationGrid().flat(Infinity) as TabulationGridItem[];
  // }

  tabulatureService: TabulatureService = inject(TabulatureService);

  @ViewChild("rowsContainer") staffElement!: ElementRef;

  constructor(private changeDetectionRef: ChangeDetectorRef) {

  }

  ngAfterViewInit() {
    this.initializeTabulature();
      window.addEventListener("resize", () => {
        this.initializeTabulature();
      });
  }

  private initializeTabulature() {
    this.containerWidth = this.staffElement.nativeElement.offsetWidth;
    this.tabulatureService.initializeBars();
    this.tabulatureService.renderBars();
    this.changeDetectionRef.detectChanges();
  }

  @HostListener("window:keydown", ["$event"])
  public handleKeyDown(event: KeyboardEvent) {
    if (event.key in ArrowKeyEnum) {
      this.tabulatureService.highlightNearestItem(event.key as ArrowKey)
    }
    // if (this.highlightedTabulationGridItem) {
      // this.tabulatureService.insertTabItem(event.key, this.highlightedTabulationGridItem?.x, this.highlightedTabulationGridItem?.stringNumber);
    // }
  }

  public highlightSpotOnStaff(event: MouseEvent) {
      const elementBoundingRect: DOMRect = this.staffElement.nativeElement.getBoundingClientRect();
      const x: number = event.clientX - elementBoundingRect.left;
      const y: number = event.clientY - elementBoundingRect.top;

      // this.tabulatureService.findSpotToHighlight({x, y})
  }


}
