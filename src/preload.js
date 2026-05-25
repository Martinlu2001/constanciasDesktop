import { contextBridge, ipcRenderer } from "electron";

const api = {
    getCodeUser: (idUsers) => ipcRenderer.invoke('constancias:getCodeUser', idUsers),
    //getName: (idProduct) => ipcRenderer.invoke('constancias:delete', idProduct),
    getUserPlanilla: (idUsers) => ipcRenderer.invoke('constancias:getUserPlanilla', idUsers),
    //getConstancia: () => ipcRenderer.invoke('constancias:getAll'),
}
contextBridge.exposeInMainWorld('api', api)