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

    //mostrar fechas especificas
    /*ipcMain.handle("constancias:getConstanciaFechaEspecifica", async (event) => {
        return db.getConstanciaFechaEspecifica();
    });*/
    ipcMain.handle("constancias:getConstanciaFechaEspecifica", async (event, idUsers) => {
        return db.getConstanciaFechaEspecifica(idUsers);
    });
    ipcMain.handle(
        "constancias:getMesesPorAnio",
        async (event, idUsers, idanioPlanillas) => {

            return db.getMesesPorAnio(idUsers, idanioPlanillas);
        }
    );
    //mostrar rango
    /*ipcMain.handle("constancias:getConstanciaRango", async (event, idPlanillas) => {
        return db.getConstanciaRango(idPlanillas);
    });*/
        ipcMain.handle(
        "constancias:getConstanciaRango",
        async (event, idUsers, inicio, fin) => {

            return db.getConstanciaRango(
                idUsers,
                inicio,
                fin
            );

        }
    );

        ipcMain.handle(
        "constancias:getConstanciaEspecifica",
        async (event, idUsers, fechas) => {

            return db.getConstanciaEspecifica(
                idUsers,
                fechas
            );
        }
    );
    //generar constancia
    /*ipcMain.handle('constancias:',(_,)=>{

    });*/
     console.log('ipc ready');
}