import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild, ViewEncapsulation
} from "@angular/core";
import {TabulatureService} from "../../services/tabulature.service";
import {TabInterface} from "../../configs/tab-interface.config";
import {ArrowKey} from "../../types/arrow-key.type";
import {ArrowKeyEnum} from "../../enums/arrow-key.enum";
import {TabulatureRowComponent} from "./_components/tabulature-row/tabulature-row.component";
import {Row} from "../../types/row.type";
import {TabObjectType} from "../../enums/tab-object-type.enum";
import {HighlightService} from "../../services/highlight.service";
import {BarError} from "../../types/bar-error.type";
import {NgTemplateOutlet} from "@angular/common";
import {TimeSignatureDialogComponent} from "./_components/time-signature-dialog/time-signature-dialog.component";
import {TimeSignatureService} from "./_components/time-signature-dialog/time-signature.service";
import {TabPlayerComponent} from "./_components/tab-player/tab-player.component";
import {Toast} from "primeng/toast";
import {TabulatureEditorService} from "./tabulature-editor.service";


@Component({
  selector: "app-tabulature-editor",
  standalone: true,
  imports: [
    TabulatureRowComponent,
    NgTemplateOutlet,
    TimeSignatureDialogComponent,
    TabPlayerComponent,
    Toast,
  ],
  templateUrl: "./tabulature-editor.component.html",
  styleUrl: "./tabulature-editor.component.scss",
  encapsulation: ViewEncapsulation.None
})
export class TabulatureEditorComponent implements AfterViewInit{

  tabulatureService: TabulatureService = inject(TabulatureService);
  tabulatureEditorService: TabulatureEditorService = inject(TabulatureEditorService);

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

  get barErrors(): BarError[] {
    return this.tabulatureService.barErrors();
  }


  @ViewChild("rowsContainer") staffElement!: ElementRef;

  constructor(private changeDetectionRef: ChangeDetectorRef) {
    effect(() => this.tabulatureEditorService.saveTabulature(this.tabulatureService.tabulation()));
  }

  ngAfterViewInit() {
    this.initializeTabulature();
      window.addEventListener("resize", () => {
        this.initializeTabulature();
      });
  }

  public currentBarErrors(index: number): BarError[] {
    return this.barErrors.filter(error => error.rowIndex === index);
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

  private initializeTabulature() {
    this.containerWidth = this.staffElement.nativeElement.offsetWidth;
    const tabulature = this.tabulatureEditorService.getTabulature();
    this.tabulatureService.initializeBars();
    this.tabulatureService.renderBars();
    if (!!tabulature) {
      this.tabulatureService.updateTabulation(tabulature);
    }
    this.changeDetectionRef.detectChanges();
  }

}
