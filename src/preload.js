import { contextBridge, ipcRenderer } from "electron";

const api = {
    getCodeUser: (idUsers) => ipcRenderer.invoke('constancias:getCodeUser', idUsers),
    //getName: (idProduct) => ipcRenderer.invoke('constancias:delete', idProduct),
    getUserPlanilla: (idUsers) => ipcRenderer.invoke('constancias:getUserPlanilla', idUsers),
    getDatePlanilla: (idPlanilla) => ipcRenderer.invoke('constancias:getDatePlanilla', idPlanilla),
    getDetallePlanilla: (idPlanillas) => ipcRenderer.invoke("constancias:getDetallePlanilla", idPlanillas),
    //getConstancia: () => ipcRenderer.invoke('constancias:getAll'),
}
contextBridge.exposeInMainWorld('api', api)