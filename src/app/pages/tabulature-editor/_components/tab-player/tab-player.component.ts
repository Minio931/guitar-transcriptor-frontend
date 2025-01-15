import { Component } from '@angular/core';
import {Button} from "primeng/button";
import {TranslocoPipe} from "@jsverse/transloco";
import {Tooltip} from "primeng/tooltip";
import {UploadDialogComponent} from "./_components/upload-dialog/upload-dialog.component";

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

}
