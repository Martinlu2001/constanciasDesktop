import { ipcMain } from "electron";

export default function setUpHandlers(db){
    //buscar codigo
    ipcMain.handle('constancias:getCodeUser',(_,idUsers)=>{
        return db.getCodeUser(idUsers);
    });
    //buscar nombre
    /*ipcMain.handle('constancias:',(_,)=>{

    });*/
    //mostrar datos usuario y planillas
    ipcMain.handle('constancias:getUserPlanilla',(_,idUsers)=>{
        return db.getUserPlanilla(idUsers);
    });

    //mostras haño y mes de una planilla especifica
    ipcMain.handle("constancias:getDatePlanilla", async (event, idPlanilla) => {
        return db.getDatePlanilla(idPlanilla);
    });

    //mostrar haberes  y descuentos de una planilla especifica
    ipcMain.handle("constancias:getDetallePlanilla", async (event, idPlanillas) => {
        return db.getDetallePlanilla(idPlanillas);
    });
    //generar constancia
    /*ipcMain.handle('constancias:',(_,)=>{

    });*/
     console.log('ipc ready');
}