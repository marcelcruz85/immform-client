import { Input } from './../../core/input';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { PDFAnnotationData } from 'pdfjs-dist/build/pdf';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { saveAs } from 'file-saver';

import * as print from 'print-js';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  readonly dpiRatio = 96 / 72;
  public pdfSrc;
  public myForm: FormGroup;
  public inputList: Input[] = [];
  public zoom = 1;
  private contactId: string;
  public blobUrl: any;
  public loading: boolean;
  public isChecked = false;
  public checkBoxSize: string;
  public formName: string;

  // public pageNumber: number;
  public page: number = 1;
  public totalPages: number;
  public isLoaded: boolean = false;

  public fomrValues = [
    {name: 'Family Name Last Name', value: 'Marcel'},
    {name: 'LastName', value: 'Cruz'},
    {name: 'Group1', value: 'Choice4'},
  ];

  constructor(
    private _fb: FormBuilder,
    private activateRoute : ActivatedRoute,
    private http: HttpClient,
  ) {
    this.myForm = this._fb.group({});
  }

  ngOnInit() {
    this.activateRoute.paramMap.subscribe(params => {
     this.formName = params.get('form');
     this.contactId = params.get('id');
     this.loading = false;
     this.pdfSrc = `../../assets/${this.formName}.pdf`;
    });
  }

  private createInput(annotation: PDFAnnotationData, rect: number[] = null, pageNumber: number) {
    let formControl = new FormControl(annotation.buttonValue || '');

    // console.log(annotation);
    // annotation.filedValue = 'Marcel';

    const input = new Input();
    input.name = annotation.fieldName;
    input.pageNumber = pageNumber;

    if (annotation.fieldType === 'Tx' && !annotation.multiLine && !annotation.comb && annotation.alternativeText !== 'date') {
        input.type = 'text';
        input.value = annotation.buttonValue || '';
    }

    if (annotation.comb) {
      input.type = 'comb';
      input.value = annotation.buttonValue || '';
      input.class = annotation.comb ? 'comb' : '';
      input.spacing = (rect[2] - rect[0]) / annotation.maxLen - 10.5;
      input.maxLen = annotation.maxLen;
    }

    if (annotation.alternativeText === 'date') {
      input.type = 'date';
      input.value = annotation.buttonValue || '';
    }

    if (annotation.multiLine){
      input.type = 'textarea';
      input.value = annotation.buttonValue  || '';
    }

    if (annotation.fieldType === 'Btn' && !annotation.checkBox) {
      // console.log(annotation);
      input.type = 'radio';
      input.value = annotation.buttonValue || false;
      formControl = new FormControl(annotation.fieldName || false);
    }

    if (annotation.checkBox) {
        input.type = 'checkbox';
        input.value = true;
        formControl = new FormControl(annotation.buttonValue || false);
    }

    if (annotation.fieldType === 'Ch' ) {
        // console.log(annotation);
        input.type = 'select';
        input.value = annotation.fieldValue || '';
        input.options = annotation.options;
  }

    // Calculate all the positions and sizes
    if (rect) {
        input.top = rect[1] - (rect[1] - rect[3]);
        input.left = rect[0];
        input.height = (rect[1] - rect[3]) * .9;
        input.width = (rect[2] - rect[0]);
    }

    this.inputList.push(input);
    return formControl;
}

private addInput(annotation: PDFAnnotationData, rect: number[] = null, pageNumber: number): void {
    // add input to page
    this.myForm.addControl(annotation.fieldName, this.createInput(annotation, rect, pageNumber));
}

public getInputPosition(input: Input): any {
    return {
        top: `${input.top}px`,
        left: `${input.left}px`,
        height: `${input.height}px`,
        width: `${input.width}px`,
    };
}

public getInputPositionCheckBox(input: Input): any {
  return {
      top: `${input.top + 1}px`,
      left: `${input.left + 1}px`,
      height: `${input.height}px`,
      width: `${input.width}px`,
  };
}

public zoomIn(): void {
  const prevZoom = `zoom_${this.zoom}`;
  const actualZoom = 'zoom_' + (this.zoom + .25);
  document.getElementById('input-form').classList.remove(prevZoom);
  document.getElementById('input-form').classList.add(actualZoom);

  const scale = this.zoom + .4;
  this.checkBoxSize = `scale(${scale})`;
  this.inputList = this.inputList.map(i => {
        i.left *= (.25 / this.zoom) + 1;
        i.top *= (.25 / this.zoom) + 1;
        i.width *= (.25 / this.zoom) + 1;
        i.height *= (.25 / this.zoom) + 1;
        i.spacing = (i.width) / i.maxLen - 10.5;
        return i;
    });
  this.zoom += .25;
}

public zoomOut(): void {

  const prevZoom = `zoom_${this.zoom}`;
  const actualZoom = 'zoom_' + (this.zoom - .25);
  document.getElementById('input-form').classList.remove(prevZoom);
  document.getElementById('input-form').classList.add(actualZoom);

  const scale = this.zoom - .4;
  this.checkBoxSize = `scale(${scale})`;
  this.inputList = this.inputList.map(i => {
        i.left *= 1 - (.25 / this.zoom);
        i.top *= 1 - (.25 / this.zoom);
        i.width *= 1 - (.25 / this.zoom);
        i.height *= 1 - (.25 / this.zoom);
        i.spacing = (i.width) / i.maxLen - 10.5;
        return i;
    });
  this.zoom -= .25;
}
public nextPage() {
  this.page++;
}

public prevPage() {
  this.page--;
}
public loadComplete(pdf: PDFDocumentProxy): void {
    this.loading = true;
    this.totalPages = pdf.numPages;
    for (let i = 1; i <= pdf.numPages; i++) {

        // track the current page
        let currentPage = null;
        pdf.getPage(i).then(p => {
            currentPage = p;
            // get the annotations of the current page
            return p.getAnnotations();
        }).then(ann => {

            // ugly cast due to missing typescript definitions
            // please contribute to complete @types/pdfjs-dist
            const annotations = (<any>ann) as PDFAnnotationData[];

            annotations
                .filter(a => a.subtype === 'Widget') // get the form field annotation only
                .forEach(a => {
                    // console.log(currentPage);
                    // get the rectangle that represent the single field
                    // and resize it according to the current DPI
                    const pageNumber = currentPage.pageIndex + 1;
                    const fieldRect = currentPage.getViewport(this.dpiRatio)
                        .convertToViewportRectangle(a.rect);

                    // const fieldTop = ((i - 1) * currentPage.getViewport(this.dpiRatio).height) + ((i - 1) * 9);
                    // add the corresponding input
                    this.addInput(a, fieldRect, pageNumber);
                });
        });
    }

    setTimeout(() => {
      console.log('loaded');
      this.loading = false;
      this.isLoaded = true;
      // this.fomrValues.map(res => {
      //   this.myForm.get(res.name).setValue(res.value);
      // });
    }, 1000);
    // console.log('finih')
}

async downloadForm() {
  this.loading = true;
  let headers = new HttpHeaders();
  const formData = await this.checkValue();
  headers = headers.set('Accept', ['application/pdf', 'application/json']);
  this.http.post(`http://localhost:3000/api/${this.formName}`, formData, { headers: headers, responseType: 'blob' }).subscribe(resp => {
    console.log('Response: ', resp);
    const file = new Blob([resp], {type: 'application/pdf'});
    saveAs(file, 'testData.pdf');
    this.loading = false;
  });
  // console.log({formType: 'ar-11', formData: this.myForm.value});
}
async printForm() {
  this.loading = true;
  const formData = await this.checkValue();
  let headers = new HttpHeaders();
  headers = headers.set('Accept', ['application/pdf', 'application/json']);
  this.http.post(`http://localhost:3000/api/${this.formName}`, formData, { headers: headers, responseType: 'blob' }).subscribe(resp => {
    // console.log('Response: ', resp);
    const file = new Blob([resp], {type: 'application/pdf'});
    this.blobUrl = URL.createObjectURL(file);

    print({ printable: this.blobUrl, type: 'pdf'});
    this.loading = false;
  });
}

  checkValue() {
    const formData = this.myForm.value;
    for (const key in formData) {
      if (formData[key] === true) {
        formData[key] = 'On';
      } else if (formData[key] === false) {
          formData[key] = 'Off';
      }
    }
    return formData;
  }

  radioClicked(input) {
    console.log(input);
    const radioName = input.name;
    const formValue = this.myForm.value[radioName];
    const radioValue = input.value;

    if (formValue === radioValue) {
      this.myForm.get(radioName).setValue(radioName);
    }
  }
}
