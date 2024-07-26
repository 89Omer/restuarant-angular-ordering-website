import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-food-categories',
  templateUrl: './food-categories.component.html',
  styleUrls: ['./food-categories.component.scss']
})
export class FoodCategoriesComponent implements OnInit {
  categories:any[]=[{image:'assets/images/empty_image.png',title:'NON-VEG'},{image:'assets/img/gallery/discount-item-1.png',title:'VEG'},{image:'assets/images/empty_image.png',title:'FISH & SEA FOOD'},{image:'assets/images/empty_image.png',title:'HOT MEZZA'},{image:'assets/images/empty_image.png',title:'BAKERY & PASTRY'}]
  constructor() { }

  ngOnInit(): void {
  }



}
