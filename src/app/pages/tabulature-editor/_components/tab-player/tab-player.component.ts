import {Component, inject} from '@angular/core';
import {Button} from "primeng/button";
import {TranslocoPipe} from "@jsverse/transloco";
import {Tooltip} from "primeng/tooltip";
import {UploadDialogComponent} from "./_components/upload-dialog/upload-dialog.component";
import {UploadDialogService} from "./_components/upload-dialog/upload-dialog.service";

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

  openUploadDialog(): void {
    this.uploadDialogService.openUploadDialog();
  }
}
