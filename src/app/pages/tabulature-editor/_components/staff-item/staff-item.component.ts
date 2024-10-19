import {Component, input} from "@angular/core";


@Component({
  selector: "app-staff-item",
  standalone: true,
  templateUrl: "./staff-item.component.html",
  styleUrl: "./staff-item.component.scss"
})
export class StaffItemComponent {
  positionX = input.required<number>();
  positionY = input.required<number>();
}
