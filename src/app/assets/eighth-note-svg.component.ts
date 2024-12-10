import {Component, input} from "@angular/core";

@Component({
  selector: "app-eighth-note-svg",
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" [class]="class()" viewBox="0 0 100 100" fill="currentColor" version="1.0">
      <path
        d="M 23.7,87.9 C 18.1,82.8 21.2,74.7 30.4,69.9 C 33.5,68.4 35.8,67.7 39.8,67.8 C 42.3,67.9 45.1,69.3 45.1,69.3 C 45.1,51.2 45.0,17.0 45.0,0.2 C 46.0,0.2 46.7,0.1 48.1,0.1 C 48.1,1.1 48.1,1.9 48.1,2.7 C 48.1,3.6 48.1,4.1 48.2,4.7 C 49.2,11.0 50.6,13.5 57.6,21.2 C 66.5,31.1 69.1,37.0 69.1,44.9 C 69.0,52.3 62.5,68.1 61.1,67.5 C 63.1,61.9 65.9,55.9 66.6,50.9 C 67.5,44.8 65.0,36.2 61.0,31.7 C 57.8,27.9 50.2,24.6 48.1,24.6 C 48.1,24.6 48.0,61.0 48.0,74.8 C 48.0,77.1 45.9,81.2 44.7,82.6 C 39.2,89.2 28.5,92.2 23.7,87.9 z"/>
    </svg>
  `,
  standalone: true
})
export class EighthNoteSvgComponent {
  class = input<string>()
}
