import {Component, computed, ElementRef, inject, input, signal, ViewChild} from "@angular/core";
import {Bar} from "../../../../types/bar.type";
import {TabInterface} from "../../../../configs/tab-interface.config";
import {TabulatureService} from "../../../../services/tabulature.service";
import {HighlightPosition} from "../../../../types/highlight-position.type";

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
  standalone: true
})
export class TabulatureRowComponent {
  protected readonly TabInterface = TabInterface;

  rowWidth = input.required<string>();

  rowHeight = input.required<string>();

  rowBars = input.required<Bar[]>();

  rowPath = input.required<string>();

  rowNumber = input.required<number>();


  tabulatureService: TabulatureService = inject(TabulatureService);

  @ViewChild('rowElement') rowElement!: ElementRef;

  get highlight(): HighlightPosition | null {
    return this.tabulatureService.highlight();
  }

  highlightPosition = computed<HighlightPosition>(() => {
    return (this.highlight?.rowNumber ?? -1) === this.rowNumber() ? this.highlight as HighlightPosition : INITIAL_HIGHLIGHT_POSITION;
  });

  public highlightSpotOnStaff(event: MouseEvent) {
    const elementBoundingRect: DOMRect = this.rowElement.nativeElement.getBoundingClientRect();
    const x: number = event.clientX - elementBoundingRect.left;
    const y: number = event.clientY - elementBoundingRect.top;

    this.tabulatureService.findSpotToHighlight({x, y}, this.rowNumber())
  }
}

