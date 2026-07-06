import { Routes } from '@angular/router';
import { AdminLayout} from './shared/admin-layout/admin-layout';

export const routes: Routes = [
  // Espacio para rutas publicas

  //

  // Rutas privadas
  { path: 'tablero',
    component: AdminLayout,
    children:[

    ]
  }
];
