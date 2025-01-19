import {inject, Injectable} from '@angular/core';
import {NotificationsService} from '../../../../services/notifications.service';
import jsPDF from 'jspdf';
import {TabulatureService} from '../../../../services/tabulature.service';
import {Row} from '../../../../types/row.type';
import {Bar} from '../../../../types/bar.type';
import {TabRenderService} from "../../../../services/tab-render.service";
import {TabInterface} from "../../../../configs/tab-interface.config";
import {BarItem} from "../../../../types/bar-item.type";
import {CalculatePositionX} from "../../../../functions/calculate-position-x.function";

const TAB_START_X = 20;
const TAB_START_Y = 20;
const ROW_HEIGHT = TabInterface.SPACE_BETWEEN_LINES * TabInterface.NUMBER_OF_LINES;
const A4_FORMAT_HEIGHT = 2480;


@Injectable({ providedIn: 'root' })
export class TabPlayerService {
  notificationsService: NotificationsService = inject(NotificationsService);
  tabulatureService: TabulatureService = inject(TabulatureService);
  tabRenderService:TabRenderService  = inject(TabRenderService);

  exportToPdf(): void {
    const clientWidth = this.tabulatureService.containerWidth();
    const doc = new jsPDF('l', 'px', [clientWidth, A4_FORMAT_HEIGHT]);

    let currentY = TAB_START_Y;
    console.log(clientWidth);

    this.tabulatureService.tabulation().forEach((row: Row) => {
      row.bars.forEach((bar: Bar, index: number) => {
        const barWidth = this.tabRenderService.calculateLengthOfBar(bar);
        const barX = this.tabRenderService.previousBarsWidth(index, row.bars) + TAB_START_X;
        this.generateBarLines(barX, currentY, barWidth, doc);

        bar.items.forEach((item: BarItem[], index: number) => {
          item.forEach((item: BarItem) => {

            if (item?.tabObject?.fretNumber !== undefined && item?.tabObject?.fretNumber !== null) {
              const x = CalculatePositionX(barX, index, bar) + TAB_START_X;
              const y = currentY + ((item?.stringNumber ?? 1) - 1) * TabInterface.SPACE_BETWEEN_LINES + (TabInterface.FONT_SIZE / 4) ;
              const fretNumber = item?.tabObject?.fretNumber;
              doc.setFillColor(255, 255, 255);
              doc.rect(x - TabInterface.FONT_SIZE / 4, y - TabInterface.FONT_SIZE / 2, TabInterface.FONT_SIZE, TabInterface.FONT_SIZE, 'F');
              doc.text(`${fretNumber}`, x, y);
            }
          })
        })

      })

      currentY += ROW_HEIGHT + TabInterface.SPACE_BETWEEN_LINES;
      if (currentY + ROW_HEIGHT > A4_FORMAT_HEIGHT) {
        doc.addPage();
        currentY = TAB_START_Y;
      }
    })

    doc.save('tabulature.pdf');
  }

  private generateBarLines(x: number, y: number, width: number, doc: jsPDF) {
    for (let i = 0; i < TabInterface.NUMBER_OF_LINES; i++) {
      const yString  = y + (i * TabInterface.SPACE_BETWEEN_LINES);
      doc.line(x, yString, x + width, yString);
      doc.line(x + width, yString, x + width,  y + (TabInterface.SPACE_BETWEEN_LINES * (TabInterface.NUMBER_OF_LINES - 1)));
    }
  }
}
