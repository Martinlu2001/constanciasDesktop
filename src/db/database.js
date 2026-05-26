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

    getDatePlanilla(idPlanilla){
        const stmt = this.db.prepare(`
            SELECT
                a.nameAnioPlanilla AS anio,
                m.nameMesPlanilla AS mes

            FROM Planillas p

            INNER JOIN anioPlanillas a
                ON p.anioPlanillas_idanioPlanillas = a.idanioPlanillas

            INNER JOIN mesPlanillas m
                ON p.mesPlanillas_idmesPlanillas = m.idmesPlanillas

            WHERE idPlanillas = ?
        `);
        return stmt.get(idPlanilla);
    }

    // OBTENER DETALLE DE UNA PLANILLA
    getDetallePlanilla(idPlanillas) {
        // HABERES
        const stmtHaberes = this.db.prepare(`
            SELECT
                h.nameHaber,
                phh.montoHaber

            FROM Planillas_has_Haberes phh

            INNER JOIN Haberes h
                ON phh.Haberes_idHaberes = h.idHaberes

            WHERE phh.Planillas_idPlanillas = ?
        `);

        // DESCUENTOS
        const stmtDescuentos = this.db.prepare(`
            SELECT
                d.nameDescuento,
                phd.montoDescuento

            FROM Planillas_has_Descuentos phd

            INNER JOIN Descuentos d
                ON phd.Descuentos_idDescuentos = d.idDescuentos

            WHERE phd.Planillas_idPlanillas = ?
        `);

        return {
            haberes: stmtHaberes.all(idPlanillas),
            descuentos: stmtDescuentos.all(idPlanillas)
        };
    }

    //buscar constancia solicitada
    getConstancia(){}

    close(){
        this.db.close();
        console.log("db closed");
    }
}
export default AppDatabase;