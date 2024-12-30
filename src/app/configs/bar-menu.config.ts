import {ContextMenuService} from "../services/context-menu.service";
import {CustomMenuItem} from "../types/custom-menu-item.type";

export function getBarMenuConfig(contextMenuService: ContextMenuService): CustomMenuItem[] {
  return [
    {
      label: "Time Signature",
      icon: "pi pi-fw pi-clock",
      action: () => {
        contextMenuService.openTimeSignatureDialog();
      }
    },
    {
      label: "Tempo",
      icon: "pi pi-stopwatch",
      action: () => {}
    }
  ]
}
