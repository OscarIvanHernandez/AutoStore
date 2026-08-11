import { CommonModule } from '@angular/common';
import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-history.html',
  styleUrl: './sales-history.css',
})
export class SalesHistory implements OnChanges {
  //Obtener las ventas


  ngOnChanges(changes: SimpleChanges): void {

  }
}
