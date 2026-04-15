import { Routes } from '@angular/router';
import { MainPageComponent } from './Pages/main-page';
import { ParametrosPageComponent } from './Pages/parametros-page';
import { ImagePageComponent } from './Pages/image-page';

export const routes: Routes = [
    {
        path: '',
        component: MainPageComponent
    },
    {
        path:'parametros',
        component:ParametrosPageComponent
    },
    {
        path: 'image',
        component: ImagePageComponent
    }
];

