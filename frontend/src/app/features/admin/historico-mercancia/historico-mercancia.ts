import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Compra } from '../../../services/autostore.models';

@Component({
  selector: 'app-historico-mercancia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historico-mercancia.html',
  styleUrl: './historico-mercancia.css',
})
export class HistoricoMercancia implements OnInit{
  //Compras y sus detalles
  historial: Compra[] = [];

  isLoading: boolean = false;

  constructor() {

  }

  ngOnInit(): void {

  }
}
