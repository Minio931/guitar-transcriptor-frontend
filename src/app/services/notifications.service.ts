import {inject, Injectable} from "@angular/core";
import {MessageService} from "primeng/api";
import {MessageType} from "../enums/message-type.enum";
import {TranslocoService} from "@jsverse/transloco";

const DEFAULT_MESSAGE_DURATION = 5000;

@Injectable({providedIn: 'root'})
export class NotificationsService {
  private readonly messageService = inject(MessageService);
  private readonly translocoService = inject(TranslocoService);

  success(message: string, duration: number = DEFAULT_MESSAGE_DURATION) {
    console.log(this.translocoService.translate(message));
    this.messageService.add({severity: MessageType.Success, detail: this.translocoService.translate(message), life: duration});
  }

  error(message: string, duration: number = DEFAULT_MESSAGE_DURATION) {
    this.messageService.add({severity: MessageType.Error, detail: this.translocoService.translate(message), life: duration});
  }

  info(message: string, duration: number = DEFAULT_MESSAGE_DURATION) {
    this.messageService.add({severity: MessageType.Info, detail: this.translocoService.translate(message), life: duration});
  }

  warning(message: string, duration: number = DEFAULT_MESSAGE_DURATION) {
    this.messageService.add({severity: MessageType.Warn, detail: this.translocoService.translate(message), life: duration});
  }

}
