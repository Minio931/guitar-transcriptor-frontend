import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild
} from "@angular/core";
import {TabulatureService} from "../../services/tabulature.service";
import {TabInterface} from "../../configs/tab-interface.config";
import {ArrowKey} from "../../types/arrow-key.type";
import {ArrowKeyEnum} from "../../enums/arrow-key.enum";
import {TabulatureRowComponent} from "./_components/tabulature-row/tabulature-row.component";
import {Row} from "../../types/row.type";
import {TabObjectType} from "../../enums/tab-object-type.enum";

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

  get activeGuitarTuning(): string[] {
    return this.tabulatureService.activeGuitarTuning();
  }

  get SPACE_BETWEEN_LINES(): number {
    return this.tabulatureService.SPACE_BETWEEN_LINES;
  }

  get tabulation(): Row[] {
    return this.tabulatureService.tabulation();
  }

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
    if (event.key === ArrowKeyEnum.Delete) {
      this.tabulatureService.removeTabElement();
    }
    this.tabulatureService.insertTabElement(TabObjectType.Note, event.key);
  }

}
