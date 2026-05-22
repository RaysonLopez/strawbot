import { Component } from "@angular/core";
import { RouterModule } from '@angular/router';

@Component({
  selector: "app-parametros-page",
  standalone: true,
  imports: [RouterModule],
  templateUrl: "./parametros-page.html",
  styleUrls: ["./parametros-page.css"],
})
export class ParametrosPageComponent {
  title = 'Parametros Page of Strawbot';
}