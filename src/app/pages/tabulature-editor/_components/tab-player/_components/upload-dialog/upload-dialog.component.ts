import {Component, inject} from '@angular/core';
import {UploadDialogService} from "./upload-dialog.service";
import {Dialog} from "primeng/dialog";
import {FileUpload, FileUploadEvent} from "primeng/fileupload";
import {SharedModule} from "primeng/api";
import {Button, ButtonDirective} from "primeng/button";
import {ProgressBar} from "primeng/progressbar";
import {Badge} from "primeng/badge";
import {TranslocoPipe} from "@jsverse/transloco";
import {Ripple} from "primeng/ripple";
import {FileSizePipe} from "../../../../../../pipes/file-size.pipe";

@Component({
  selector: 'app-upload-dialog',
  standalone: true,
  imports: [
    Dialog,
    FileUpload,
    SharedModule,
    Button,
    ProgressBar,
    Badge,
    TranslocoPipe,
    ButtonDirective,
    Ripple,
    FileSizePipe
  ],
  templateUrl: './upload-dialog.component.html',
  styleUrl: './upload-dialog.component.scss'
})
export class UploadDialogComponent {
  uploadDialogService = inject(UploadDialogService);

  get uploadDialogVisible(): boolean {
    return this.uploadDialogService.uploadDialogVisible();
  }

  set uploadDialogVisible(value: boolean) {
    this.uploadDialogService.uploadDialogVisible.set(value);
  }

  get files(): File[] {
    return this.uploadDialogService.files() ?? [];
  }

  set files(files: File[]) {
    this.uploadDialogService.files.set(files);
  }

  get loading(): boolean {
    return this.uploadDialogService.loading();
  }

  get transcribedFiles(): boolean {
    return this.uploadDialogService.filesTranscribed();
  }

  transcribeEvent() {
    this.uploadDialogService.transcribeFiles();
  }

  onSelectedFile(event: any) {
    this.files = event.currentFiles
  }

  onLoadTranscription() {
    this.uploadDialogService.loadTranscription();
  }
}
