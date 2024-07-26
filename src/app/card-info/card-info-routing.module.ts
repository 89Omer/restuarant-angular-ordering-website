import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CardInfo } from 'src/common/models/card-info.model';

const routes: Routes = [ {
  path: '',
  component: CardInfo
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CardInfoRoutingModule { }
