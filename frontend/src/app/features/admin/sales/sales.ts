import { ProductoService } from './../../../services/autostore.product-service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ItemCarrito } from '../../../services/autostore.models';
import { SaleService } from '../../../services/autostore.sales-service';

@Component({
  selector: 'app-sales',
  imports: [CommonModule],
  templateUrl: './sales.html',
  styleUrl: './sales.css',
})
export class Sales implements OnInit {

  // Busqueda de productos
  busquedaTexto: string = '';
  productosEncontrados: any[] = [];

  // Carrito de compras
  carrito: ItemCarrito[] = [];

  // Opciones de venta
  tipoVenta: 'CONTADO' | 'CREDITO' = 'CONTADO';
  clienteIdSeleccionado: number | null = null;
  descuento: number = 0;

  constructor(
    private productoService: ProductoService,
    private ventaService: SaleService
  ) {}

  ngOnInit(): void {

  }


}
