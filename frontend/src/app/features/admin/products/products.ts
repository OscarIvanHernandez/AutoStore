import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {ProductoService} from '../../../services/autostore.product-service';
import { ProductoInterface } from '../../../services/autostore.models';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-products',
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit{
  productos: ProductoInterface[] = [];
  isLoading: boolean = true;
  successMessage: string | null = null;
  errorMessage: string | null = null;


  constructor(private productoService: ProductoService, private cdr: ChangeDetectorRef){}
    ngOnInit(): void{
      this.cargarProductos();
    }

  cargarProductos(): void {
    this.isLoading = true;
    this.productoService.getProductosActivos().subscribe({
      next: (productos) => {
        console.log('Productos cargados:', productos);
        this.productos = productos;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.errorMessage = 'Hubo un error al cargar los horarios. (${error.status})';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

}
