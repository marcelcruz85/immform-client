import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

export interface FormData {
  file: string;
  name: string;
  details: string;
}

const forms: FormData[] = [
  {file: 'n-400', name: 'N-400', details: 'Application for Naturalization'},
  {file: 'g-28', name: 'G-28', details: 'Notice of Entry of Appearance as Attorney or Accredited Representative'},
  {file: 'i-131', name: 'I-131', details: 'Application for Travel Document'},
  {file: 'ar-11', name: 'AR-11', details: 'Alien’s Change of Address Card'},
  {file: 'i-90', name: 'I-90', details: 'Alien’s Change of Address Card'},
]

@Component({
  selector: 'app-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss']
})
export class FormListComponent implements OnInit {

  displayedColumns: string[] = ['name', 'details'];
  dataSource: MatTableDataSource<FormData>;

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor() {
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(forms);
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
