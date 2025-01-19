import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true
})
export class FileSizePipe implements PipeTransform {
  transform(value: number, decimalPoints: number = 2): string {
    if (!value) return '0 MB';
    const mbValue = value / (1024 * 1024);
    return `${mbValue.toFixed(decimalPoints)} MB`;
  }

}
