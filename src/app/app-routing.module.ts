import { FormListComponent } from './form-list/form-list.component';
import { FormComponent } from './form/form/form.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'forms', component: FormListComponent },
  { path: 'form/:form', component: FormComponent },
  { path: 'form/:form/:id', component: FormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
