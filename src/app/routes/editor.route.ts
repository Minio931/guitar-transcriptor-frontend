import {Route} from "@angular/router";
import {AppRoutes} from "../configs/app-routes.config";

const EDITOR_PAGE = () => import('../pages/tabulature-editor/tabulature-editor.component').then(c => c.TabulatureEditorComponent);

export const EditorRoute: Route = {
  path: AppRoutes.Editor,
  loadComponent: EDITOR_PAGE
}
