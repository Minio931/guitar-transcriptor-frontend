import {inject, Injectable, signal} from "@angular/core";
import {TranscribeService} from "../../../../../../services/transcribe.serrvice";
import {TranscribeResponse} from "../../../../../../interfaces/transcribe-response.interface";

@Injectable({providedIn: 'root'})
export class UploadDialogService {
    transcribeService = inject(TranscribeService);

    uploadDialogVisible = signal(true);

    loading = signal(false);

    files = signal<File[]>([]);

    async transcribeFiles() {
      this.loading.set(true);
      const blob =this.convertFileToBlob(this.files()[0]);
      console.log(blob);
      this.transcribeService.transcribe(blob).subscribe({
          next: (response: TranscribeResponse) => this.handleFileSuccess(response),
          error: (error: any) => this.loading.set(false),
          complete: () => this.loading.set(false)
      })
    }

    private handleFileSuccess(response: TranscribeResponse) {
        console.log(response);
        this.loading.set(false);
    }

    private convertFileToBlob(file: File): FormData {
      const blob = new Blob([file], {type: file.type});

      const formData = new FormData();
      formData.append("audio", blob, file.name);

      return formData;
    }
}
