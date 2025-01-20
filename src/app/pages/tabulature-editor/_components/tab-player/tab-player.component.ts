import {Component, inject} from '@angular/core';
import {Button} from "primeng/button";
import {TranslocoPipe} from "@jsverse/transloco";
import {Tooltip} from "primeng/tooltip";
import {UploadDialogComponent} from "./_components/upload-dialog/upload-dialog.component";
import {UploadDialogService} from "./_components/upload-dialog/upload-dialog.service";
import {TabPlayerService} from "./tab-player.service";
import {PlaybackService} from "../../../../services/playback.service";
import {TabulatureService} from "../../../../services/tabulature.service";

@Component({
  selector: 'app-tab-player',
  standalone: true,
  imports: [
    Button,
    TranslocoPipe,
    Tooltip,
    UploadDialogComponent
  ],
  templateUrl: './tab-player.component.html',
  styleUrl: './tab-player.component.scss'
})
export class TabPlayerComponent {
  uploadDialogService = inject(UploadDialogService);
  tabPlayerService: TabPlayerService = inject(TabPlayerService);
  playbackService: PlaybackService = inject(PlaybackService);
  tabulatureService: TabulatureService = inject(TabulatureService);

  openUploadDialog(): void {
    this.uploadDialogService.openUploadDialog();
  }

  exportTabulature() : void {
    this.tabPlayerService.exportToPdf();
  }

  playTabulature(): void {
    this.playbackService.playTabulature();
  }

  stopTabulature(): void {
    this.playbackService.stopPlayback();
  }

  resetTabulature(): void {
    this.tabulatureService.cleanTabulation();
  }
}
