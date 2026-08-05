import { ProductoService } from './../../../services/autostore.product-service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ItemCarrito, VentaRequest } from '../../../services/autostore.models';
import { SaleService } from '../../../services/autostore.sales-service';
import { it } from 'node:test';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sales',
  imports: [CommonModule, FormsModule],
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

  // Buscar productos en tiempo real
  BuscarProducto(): void {
    if (this.busquedaTexto.trim().length > 1) {
      this.productoService.buscar({q: this.busquedaTexto, estado: "activo"})
        .subscribe(data => this.productosEncontrados = data);
    } else {
      this.productosEncontrados = [];
    }
  }

  // Agrega producto a carrito
  agregarAlCarrito(producto: any): void {
    const existe = this.carrito.find(item => item.productoId === producto.id);

    if (existe) {
      if (existe.cantidad < producto.stockActual) {
        existe.cantidad++;
        this.actualizarSubtotal(existe);
      } else {
        // Agregar mensaje de error
        alert('Stock máximo alcanzado para este producto.');
      }
    } else {
      const nuevoItem: ItemCarrito = {
        productoId: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precioTipo: 'MOSTRADOR',
        precioUnitario: producto.precioMostrador,
        subTotal: producto.precioMostrador,
        stockMaximo: producto.stock
      };
      this.carrito.push(nuevoItem);
    }

    // Vaciar el buscador
    this.busquedaTexto = '';
    this.productosEncontrados = [];
  }

  cambiarTipoPrecio(item: ItemCarrito, productoOriginal: any): void {
    item.precioUnitario = item.precioTipo == 'TALLER'
      ? productoOriginal.precioVentaTaller
      : productoOriginal.precioVentaMostrador;
    this.actualizarSubtotal(item);
  }

  actualizarSubtotal(item: ItemCarrito): void {
    item.subTotal = item.precioUnitario * item.cantidad;
  }

  eliminarDelCarrito(index: number): void {
    this.carrito.splice(index, 1);
  }

  // Calculos totales
  get subtotalGeneral(): number {
    return this.carrito.reduce((acc, item) => acc + item.subTotal, 0);
  }

  get totalFinal(): number {
    const total = this.subtotalGeneral -this.descuento;
    return total > 0 ? total : 0;
  }

  // Enviar la venta
  procesarVenta(): void {
    if (this.carrito.length === 0) return;

    if (this.tipoVenta === 'CREDITO' && !this.clienteIdSeleccionado) {
      alert("Debe seleccionar un cliente para ventas a crédito.");
      return;
    }
    const procesarVenta: VentaRequest = {
      productos: this.carrito.map(item => ({
        id: item.productoId,
        cantidad: item.cantidad,
        precioTipo: item.precioTipo
      })),
      descuento: this.descuento,
      tipoVenta: this.tipoVenta,
      clienteId: this.tipoVenta === 'CREDITO' ? this.clienteIdSeleccionado : null
    };

    this.ventaService.crearVenta(procesarVenta).subscribe({
      next: (ventaCreada) => {
        alert('Venta Procesada con éxito');
        this.carrito = [];
        this.descuento = 0;
      },
      error: (err) => alert('Error al procesar la venta: ' + err.error?.message)
    });
  }

}
