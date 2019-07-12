export class Input {
  name: string;
  pageNumber: number;
  type: string; // bind this in HTML when this issue will be fixed https://github.com/angular/angular/issues/13243
  top: number;
  left: number;
  width: number;
  height: number;
  value; any;
  class: string;
  options: [];
  spacing: number;
  maxLen: number;
}
