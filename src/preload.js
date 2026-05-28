import { contextBridge, ipcRenderer } from "electron";

const api = {
    getCodeUser: (idUsers) => ipcRenderer.invoke('constancias:getCodeUser', idUsers),
    //getName: (idProduct) => ipcRenderer.invoke('constancias:delete', idProduct),
    getUserPlanilla: (idUsers) => ipcRenderer.invoke('constancias:getUserPlanilla', idUsers),
    getDatePlanilla: (idPlanilla) => ipcRenderer.invoke('constancias:getDatePlanilla', idPlanilla),
    getDetallePlanilla: (idPlanillas) => ipcRenderer.invoke("constancias:getDetallePlanilla", idPlanillas),
    getConstanciaFechaEspecifica: (idUsers) =>
    ipcRenderer.invoke("constancias:getConstanciaFechaEspecifica", idUsers),
    getMesesPorAnio: (idUsers, idanioPlanillas) =>
    ipcRenderer.invoke(
        "constancias:getMesesPorAnio",
        idUsers,
        idanioPlanillas
    ),
    //getConstanciaRango: (idPlanillas) => ipcRenderer.invoke("constancias:getConstanciaRango", idPlanillas),
    getConstanciaRango: (idUsers, inicio, fin) =>
    ipcRenderer.invoke(
        "constancias:getConstanciaRango",
        idUsers,
        inicio,
        fin
    ),
    getConstanciaEspecifica: (idUsers, fechas) =>
    ipcRenderer.invoke(
        "constancias:getConstanciaEspecifica",
        idUsers,
        fechas
    ),
    //getConstancia: () => ipcRenderer.invoke('constancias:getAll'),
}
contextBridge.exposeInMainWorld('api', api)