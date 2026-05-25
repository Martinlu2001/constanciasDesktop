import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';

class AppDatabase{

    constructor(){
        // ruta donde se guardará la bd del usuario
        const userDbPath = path.join(app.getPath('userData'),'constancias.db');

        // ruta de la bd original del proyecto
        const originalDbPath = path.join(app.getAppPath(),'src','db','constancias.db');

        // si no existe en userData, copiarla
        if (!fs.existsSync(userDbPath)) {
            fs.copyFileSync(originalDbPath, userDbPath);
            console.log('BD copiada a userData');
        }

        // abrir bd
        this.db = new Database(userDbPath);
        this.db.pragma('journal_mode = WAL');
        console.log('BD iniciada');
    }
    //buscar por codigo
    getCodeUser(idUsers){
        const stmt = this.db.prepare('SELECT * FROM Users WHERE idUsers = ?')
        return stmt.get(idUsers);
    }

    //buscar por nombre
    getName(){}

    //mostrar datos y planillas usuario
    getUserPlanilla(idUsers){
        //const stmt = this.db.prepare('SELECT * FROM Users WHERE idUsers = ?')
        const stmt = this.db.prepare(`
         SELECT 
            p.idPlanillas,

            a.nameAnioPlanilla AS anio,
            m.nameMesPlanilla AS mes,
            t.nameTipoPlanilla AS tipo,
            c.codCondicionPlanilla AS condicion

        FROM Planillas p

        INNER JOIN anioPlanillas a
            ON p.anioPlanillas_idanioPlanillas = a.idanioPlanillas

        INNER JOIN mesPlanillas m
            ON p.mesPlanillas_idmesPlanillas = m.idmesPlanillas

        INNER JOIN tipoPlanillas t
            ON p.tipoPlanillas_idtipoPlanilla = t.idtipoPlanilla

        INNER JOIN condicionPlanillas c
            ON p.condicionPlanillas_idcondicionPlanillas = c.idcondicionPlanillas

        WHERE p.Users_idUsers = ?

        `);
        return stmt.all(idUsers);
    }

    //buscar constancia especifica
    getConstancia(){}

    close(){
        this.db.close();
        console.log("db closed");
    }
}
export default AppDatabase;