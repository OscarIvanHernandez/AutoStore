import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompraRequest, Distribuidor, ItemCarrito, ProductoInterface } from '../../../services/autostore.models';
import { DistribuidorService } from '../../../services/autostore.distribuidor-service';
import { ProductoService } from '../../../services/autostore.product-service';
import { CompraDistribuidorService } from '../../../services/autostore.compra-distribuidor-service';
import { BaseComponent } from '../base-component/base-component';

@Component({
  selector: 'app-compra-distribuidores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compra-distribuidores.html',
  styleUrl: './compra-distribuidores.css',
})
export class CompraDistribuidores extends BaseComponent implements OnInit {
  distribuidores: Distribuidor[] = [];
  productos: ProductoInterface[] = [];
  hasLoadedDistribuidores = false;
  hasLoadedProductos = false;

  distribuidorSeleccionadoId: number | null = null;
  folio = '';
  productoSeleccionado: ProductoInterface | null = null;
  cantidad = 1;
  precioUnitarioCompra = 0;
  items: ItemCarrito[] = [];
  totalCompra = 0;

  constructor(
    private distribuidorService: DistribuidorService,
    private productoService: ProductoService,
    private compraService: CompraDistribuidorService,
    cdr: ChangeDetectorRef
  ) {
    super(cdr);
  }

  ngOnInit(): void {
    this.cargarDistribuidores();
    this.cargarProductos();
  }

  cargarDistribuidores(): void {
    this.cargarRecurso(
      'cargarDistribuidores',
      this.distribuidorService.listar(),
      (data) => {
        this.distribuidores = data.filter((distribuidor) => distribuidor.activo);
        if (!this.distribuidores.some((distribuidor) => distribuidor.id === this.distribuidorSeleccionadoId)) {
          this.distribuidorSeleccionadoId = null;
        }
        this.hasLoadedDistribuidores = true;
      },
      'los distribuidores'
    );
  }

  cargarProductos(): void {
    this.cargarRecurso(
      'cargarProductos',
      this.productoService.getProductos(),
      (data) => {
        this.productos = data.filter((producto) => producto.activo !== false);
        if (this.productoSeleccionado) {
          this.productoSeleccionado = this.productos.find((producto) => producto.id === this.productoSeleccionado?.id) ?? null;
        }
        this.hasLoadedProductos = true;
      },
      'los productos'
    );
  }

  onSeleccionarProducto(): void {
    this.errorMessage = null;
    if (this.productoSeleccionado) {
      this.precioUnitarioCompra = this.productoSeleccionado.precioCompra || 0;
    }
  }

  agregarProducto(): void {
    if (!this.productoSeleccionado || this.productoSeleccionado.id == null) {
      this.showErrorMessage('Selecciona un producto para agregarlo a la entrada.');
      return;
    }
    if (!Number.isInteger(this.cantidad) || this.cantidad <= 0) {
      this.showErrorMessage('La cantidad debe ser un número entero mayor que cero.');
      return;
    }
    if (!Number.isFinite(this.precioUnitarioCompra) || this.precioUnitarioCompra <= 0) {
      this.showErrorMessage('El costo unitario debe ser mayor que cero.');
      return;
    }

    this.items = [...this.items, {
      productoId: this.productoSeleccionado.id,
      nombre: this.productoSeleccionado.nombre,
      cantidad: this.cantidad,
      precioUnitario: this.precioUnitarioCompra,
      subTotal: this.cantidad * this.precioUnitarioCompra,
      precioTipo: 'MOSTRADOR',
      stockMaximo: this.productoSeleccionado.stockActual,
    }];

    this.calcularTotal();
    this.limpiarSeleccionProducto();
    this.errorMessage = null;
  }

  quitarItem(index: number): void {
    this.items = this.items.filter((_, itemIndex) => itemIndex !== index);
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.totalCompra = this.items.reduce((total, item) => total + item.subTotal, 0);
  }

  guardarCompra(): void {
    if (this.distribuidorSeleccionadoId === null || this.items.length === 0) {
      this.showErrorMessage('Selecciona un distribuidor y agrega al menos un producto.');
      return;
    }

    const payload: CompraRequest = {
      distribuidorId: this.distribuidorSeleccionadoId,
      folio: this.folio.trim() || undefined,
      productos: this.items.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitarioCompra: item.precioUnitario,
      })),
    };

    this.ejecutarMutacion(this.compraService.registrarCompra(payload), 'registrar compra', () => {
      this.items = [];
      this.calcularTotal();
      this.folio = '';
      this.limpiarSeleccionProducto();
      this.showSuccessMessage('Entrada registrada. Se está actualizando el inventario.');
      this.cargarProductos();
    });
  }

  private limpiarSeleccionProducto(): void {
    this.productoSeleccionado = null;
    this.cantidad = 1;
    this.precioUnitarioCompra = 0;
  }
}
