import { Component } from "@angular/core";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface Parametro {
  id: string;
  titulo: string;
  descripcion: string;
}

const PARAMETROS: Parametro[] = [
  {
    id: 'color',
    titulo: 'Color',
    descripcion: `El color de una fresa es un factor de calidad reconocible por el Strawbot debido a un análisis sobre la colorimetría saludable como producto orgánico, junto con la detección de plagas y enfermedades fúngicas que comprometen la fruta de manera visible, siendo importante detectarlo antes de poder extenderse por todo un lote y echarlo a perder.`
  },
  {
    id: 'forma',
    titulo: 'Forma',
    descripcion: `La forma de una fresa como factor de calidad es algo identificable por el Strawbot debido a las lesiones físicas que pueden sufrir debido a las plagas, junto a las malformaciones durante su crecimiento que afectan la apariencia del producto volviéndolo menos apetecible para los compradores.`
  }
];

@Component({
  selector: "app-parametros-page",
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: "./parametros-page.html",
  styleUrls: ["./parametros-page.css"],
})
export class ParametrosPageComponent {
  title = 'Parametros Page of Strawbot';
  parametros = PARAMETROS;
  selectedParametro: Parametro | null = null;

  openDescripcion(parametro: Parametro) {
    this.selectedParametro = parametro;
  }

  closeDescripcion() {
    this.selectedParametro = null;
  }
}
