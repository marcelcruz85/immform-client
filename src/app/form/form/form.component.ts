import { Input } from './../../core/input';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { PDFAnnotationData } from 'pdfjs-dist/build/pdf';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  readonly dpiRatio = 96 / 72;
  public pdfSrc = '../../assets/pdf-test.pdf';
  public myForm: FormGroup;
  public inputList: Input[] = [];
  public zoom = 1;
  private formType: string;
  private contactId: string;

  public fomrValues = [
    {name: 'name', value: 'Marcel'},
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
      this.formType = params.get('form');
      this.contactId = params.get('id');
      // console.log(this.contactId);
    });
  }

  private createInput(annotation: PDFAnnotationData, rect: number[] = null) {
    let formControl = new FormControl(annotation.buttonValue || '');

    // console.log(annotation);
    // annotation.filedValue = 'Marcel';

    const input = new Input();
    input.name = annotation.fieldName;

    if (annotation.fieldType === 'Tx') {
        input.type = 'text';
        input.value = annotation.buttonValue || '';
    }

    if (annotation.fieldType === 'Btn' && !annotation.checkBox) {
        input.type = 'radio';
        input.value = annotation.buttonValue;
    }

    if (annotation.checkBox) {
        input.type = 'checkbox';
        input.value = true;
        formControl = new FormControl(annotation.buttonValue || false);
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

private addInput(annotation: PDFAnnotationData, rect: number[] = null): void {
    // add input to page
    this.myForm.addControl(annotation.fieldName, this.createInput(annotation, rect));

    // setTimeout(() => {

    // this.fomrValues.map(res => {
    //   this.myForm.get(res.name).setValue(res.value);
    // });
    // }, 1000);
    // console.log('finih')
}

public getInputPosition(input: Input): any {
    return {
        top: `${input.top}px`,
        left: `${input.left}px`,
        height: `${input.height}px`,
        width: `${input.width}px`,
    };
}

public zoomIn(): void {
    this.inputList = this.inputList.map(i => {
        i.left *= (.25 / this.zoom) + 1;
        i.top *= (.25 / this.zoom) + 1;
        i.width *= (.25 / this.zoom) + 1;
        i.height *= (.25 / this.zoom) + 1;
        return i;
    });
    this.zoom += .25;
}

public zoomOut(): void {
    this.inputList = this.inputList.map(i => {
        i.left *= 1 - (.25 / this.zoom);
        i.top *= 1 - (.25 / this.zoom);
        i.width *= 1 - (.25 / this.zoom);
        i.height *= 1 - (.25 / this.zoom);
        return i;
    });
    this.zoom -= .25;
}

public loadComplete(pdf: PDFDocumentProxy): void {
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

                    // get the rectangle that represent the single field
                    // and resize it according to the current DPI
                    const fieldRect = currentPage.getViewport(this.dpiRatio)
                        .convertToViewportRectangle(a.rect);

                    // add the corresponding input
                    this.addInput(a, fieldRect);
                });
        });
    }
}
public downloadForm() {
  let headers = new HttpHeaders();
  headers = headers.set('Accept', ['application/pdf', 'application/json']);
  this.http.post('http://localhost:3000/api/ar-11', this.myForm.value, { headers: headers, responseType: 'blob' }).subscribe(resp => {
    console.log('Response: ', resp);
    const file = new Blob([resp], {type: 'application/pdf'});
    saveAs(file, 'testData.pdf');
    console.log(file);
  });
  // console.log({formType: 'ar-11', formData: this.myForm.value});
}
public printForm() {
  let headers = new HttpHeaders();
  headers = headers.set('Accept', ['application/pdf', 'application/json']);
  this.http.post('http://localhost:3000/api/ar-11', this.myForm.value, { headers: headers, responseType: 'blob' }).subscribe(resp => {
    // console.log('Response: ', resp);
    const file = new Blob([resp], {type: 'application/pdf'});
    const blobUrl = URL.createObjectURL(file);
    setTimeout(() => {

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.contentWindow.print();
    }, 2000);
  });
}
}
