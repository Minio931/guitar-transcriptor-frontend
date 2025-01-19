import {inject, Injectable, signal} from "@angular/core";
import {TranscribeService} from "../../../../../../services/transcribe.service";
import {TranscribeResponse} from "../../../../../../interfaces/transcribe-response.interface";
import {Transcript} from "../../../../../../models/transcript.model";
import {TimeSignature} from "../../../../../../types/time-signature.type";
import {TabulatureService} from "../../../../../../services/tabulature.service";
import {NotificationsService} from "../../../../../../services/notifications.service";

@Injectable({providedIn: 'root'})
export class UploadDialogService {
    transcribeService = inject(TranscribeService);
    tabulatureService = inject(TabulatureService);
    notificationsService = inject(NotificationsService);

    uploadDialogVisible = signal(false);

    loading = signal(false);

    files = signal<File[]>([]);

    filesTranscribed = signal<boolean>(false);

    transcript = signal<Transcript | null>(null);

    openUploadDialog() {
      this.uploadDialogVisible.set(true);
    }

    transcribeFiles() {
      this.loading.set(true);
      const blob = this.convertFileToBlob(this.files()[0]);
      this.transcribeService.transcribe(blob).subscribe({
          next: (response: TranscribeResponse) => this.handleFileSuccess(response),
          error: (error: any) => this.handleFileError(error),
          complete: () => this.loading.set(false)
      })
    }

    loadTranscription() {
        this.uploadDialogVisible.set(false);
        this.tabulatureService.loadTranscription(this.transcript()!);
    }

    private handleFileSuccess(response: TranscribeResponse) {
        this.loading.set(false);
        if (response?.bars?.length > 0) {
            this.filesTranscribed.set(true);
            const timeSignature: TimeSignature = {
                numerator: response.numerator,
                denominator: response.denominator
            };
            this.transcript.set(new Transcript({bars: response.bars, timeSignature}));
            this.notificationsService.success("_Notification.Successfully transcribed file");
        }
    }

    private handleFileError(error: any) {
        this.loading.set(false);
        this.notificationsService.error("_Notification.Error while transcribing file");
    }


    private convertFileToBlob(file: File): FormData {
      const blob = new Blob([file], {type: file.type});

      const formData = new FormData();
      formData.append("audio", blob, file.name);

      return formData;
    }
}
