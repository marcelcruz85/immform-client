import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationComponent } from './navigation/navigation.component';
import { LayoutModule } from '@angular/cdk/layout';
import { FormComponent } from './form/form/form.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormListComponent } from './form-list/form-list.component';


import { MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatProgressBarModule,
  MatCheckboxModule,
  MatRadioModule,
  MatFormFieldModule,
  MatSortModule,
  MatPaginatorModule,
  MatTableModule,
  MatInputModule,
  MatDatepickerModule,
  MatNativeDateModule} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    FormComponent,
    FormListComponent
  ],
  imports: [
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    // MatPaginatorModule,
    MatTableModule,
    MatInputModule,
    MatRadioModule,
    PdfViewerModule,
    HttpClientModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
