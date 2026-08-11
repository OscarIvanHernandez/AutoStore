import { CommonModule } from '@angular/common';
import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VentaInterface } from '../../../services/autostore.models';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sales-history.html',
  styleUrl: './sales-history.css',
})
export class SalesHistory implements OnChanges {
  //Obtener las ventas
  ventas: VentaInterface[] = [];


  ngOnChanges(changes: SimpleChanges): void {

  }
}
