import { Routes } from '@angular/router';
import { AdminLayout} from './shared/admin-layout/admin-layout';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { Products } from './features/admin/products/products';

export const routes: Routes = [
  // Espacio para rutas publicas

  //

  // Rutas privadas
  { path: 'admin',
    component: AdminLayout,
    children:[
      {path: 'tablero', component: Dashboard},
      {path: 'productos', component: Products},
    ]
  }
];
