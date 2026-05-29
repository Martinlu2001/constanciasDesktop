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

    //obtener anio y mes de una planilla en el modal
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

    // OBTENER DETALLE DE UNA PLANILLA EN EL MODAL
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

    // OBTENER AÑOS DISPONIBLES DE UN USUARIO
    getConstanciaFechaEspecifica(idUsers){

            const stmt = this.db.prepare(`
            SELECT DISTINCT
            a.idanioPlanillas,
            a.nameAnioPlanilla

            FROM Planillas p

            INNER JOIN anioPlanillas a
                ON p.anioPlanillas_idanioPlanillas = a.idanioPlanillas

            WHERE p.Users_idUsers = ?

            ORDER BY a.nameAnioPlanilla ASC
        `);

        return stmt.all(idUsers);
    }

    // OBTENER MESES SEGÚN EL AÑO
    getMesesPorAnio(idUsers, idanioPlanillas){

        const stmt = this.db.prepare(`
            SELECT DISTINCT
            m.idmesPlanillas,
            m.nameMesPlanilla

            FROM Planillas p

            INNER JOIN mesPlanillas m
                ON p.mesPlanillas_idmesPlanillas = m.idmesPlanillas

            WHERE p.Users_idUsers = ?
            AND p.anioPlanillas_idanioPlanillas = ?

            ORDER BY m.idmesPlanillas ASC
        `);

        return stmt.all(idUsers, idanioPlanillas);
    }
    
    // IMPRIMIR RANGO
    getConstanciaRango(idUsers, inicio, fin) {

        const stmt = this.db.prepare(`

            SELECT
                p.idPlanillas,

                u.idUsers,

                u.apelliPatUser,
                u.apelliMatUser,
                u.nameUser,

                tp.nameTipoPlanilla AS tipoPlanilla,

                a.nameAnioPlanilla AS anio,
                m.nameMesPlanilla AS mes,

                -- HABERES
                (
                    SELECT GROUP_CONCAT(
                        h.nameHaber || ':' ||
                        IFNULL(phh.montoHaber, 0)
                    )

                    FROM Planillas_has_Haberes phh

                    INNER JOIN Haberes h
                        ON h.idHaberes =
                        phh.Haberes_idHaberes

                    WHERE phh.Planillas_idPlanillas =
                        p.idPlanillas

                ) AS haberes,

                -- DESCUENTOS
                (
                    SELECT GROUP_CONCAT(
                        d.nameDescuento || ':' ||
                        IFNULL(phd.montoDescuento, 0)
                    )

                    FROM Planillas_has_Descuentos phd

                    INNER JOIN Descuentos d
                        ON d.idDescuentos =
                        phd.Descuentos_idDescuentos

                    WHERE phd.Planillas_idPlanillas =
                        p.idPlanillas

                ) AS descuentos,

                -- TOTAL HABERES
                (
                    SELECT IFNULL(SUM(phh.montoHaber), 0)

                    FROM Planillas_has_Haberes phh

                    WHERE phh.Planillas_idPlanillas =
                        p.idPlanillas

                ) AS totalHaberes,

                -- TOTAL DESCUENTOS
                (
                    SELECT IFNULL(SUM(phd.montoDescuento), 0)

                    FROM Planillas_has_Descuentos phd

                    WHERE phd.Planillas_idPlanillas =
                        p.idPlanillas

                ) AS totalDescuentos,

                -- LIQUIDO
                (
                    (
                        SELECT IFNULL(SUM(phh.montoHaber), 0)
                        FROM Planillas_has_Haberes phh
                        WHERE phh.Planillas_idPlanillas =
                            p.idPlanillas
                    )

                    -

                    (
                        SELECT IFNULL(SUM(phd.montoDescuento), 0)
                        FROM Planillas_has_Descuentos phd
                        WHERE phd.Planillas_idPlanillas =
                            p.idPlanillas
                    )
                ) AS liquido

            FROM Planillas p

            INNER JOIN Users u
                ON u.idUsers = p.Users_idUsers

            INNER JOIN anioPlanillas a
                ON a.idanioPlanillas =
                p.anioPlanillas_idanioPlanillas

            INNER JOIN mesPlanillas m
                ON m.idmesPlanillas =
                p.mesPlanillas_idmesPlanillas

            INNER JOIN tipoPlanillas tp
                ON tp.idtipoPlanilla =
                p.tipoPlanillas_idtipoPlanilla

            WHERE p.Users_idUsers = ?

            AND (
                (a.nameAnioPlanilla * 100 + m.idmesPlanillas)
            )
            BETWEEN ? AND ?

            ORDER BY
                a.nameAnioPlanilla,
                m.idmesPlanillas

        `);

        return stmt.all(idUsers, inicio, fin);

    }

    getConstanciaEspecifica(idUsers, fechas){

        // CONSTRUIR CONDICIONES
        const condiciones = fechas.map(() => `
            (
                p.anioPlanillas_idanioPlanillas = ?
                AND
                p.mesPlanillas_idmesPlanillas = ?
            )
        `).join(' OR ');

        // PARÁMETROS
        const params = [idUsers];

        fechas.forEach(f => {
            params.push(f.idanio);
            params.push(f.idmes);
        });

        const stmt = this.db.prepare(`

            SELECT
                p.idPlanillas,

                u.idUsers,

                u.apelliPatUser,
                u.apelliMatUser,
                u.nameUser,

                tp.nameTipoPlanilla AS tipoPlanilla,

                a.nameAnioPlanilla AS anio,
                m.nameMesPlanilla AS mes,

                -- HABERES
                (
                    SELECT GROUP_CONCAT(
                        h.nameHaber || ':' ||
                        IFNULL(phh.montoHaber, 0)
                    )

                    FROM Planillas_has_Haberes phh

                    INNER JOIN Haberes h
                        ON h.idHaberes =
                        phh.Haberes_idHaberes

                    WHERE phh.Planillas_idPlanillas =
                        p.idPlanillas

                ) AS haberes,

                -- DESCUENTOS
                (
                    SELECT GROUP_CONCAT(
                        d.nameDescuento || ':' ||
                        IFNULL(phd.montoDescuento, 0)
                    )

                    FROM Planillas_has_Descuentos phd

                    INNER JOIN Descuentos d
                        ON d.idDescuentos =
                        phd.Descuentos_idDescuentos

                    WHERE phd.Planillas_idPlanillas =
                        p.idPlanillas

                ) AS descuentos,

                -- TOTAL HABERES
                (
                    SELECT IFNULL(
                        SUM(phh.montoHaber),
                        0
                    )

                    FROM Planillas_has_Haberes phh

                    WHERE phh.Planillas_idPlanillas =
                        p.idPlanillas

                ) AS totalHaberes,

                -- TOTAL DESCUENTOS
                (
                    SELECT IFNULL(
                        SUM(phd.montoDescuento),
                        0
                    )

                    FROM Planillas_has_Descuentos phd

                    WHERE phd.Planillas_idPlanillas =
                        p.idPlanillas

                ) AS totalDescuentos,

                -- LIQUIDO
                (
                    (
                        SELECT IFNULL(
                            SUM(phh.montoHaber),
                            0
                        )

                        FROM Planillas_has_Haberes phh

                        WHERE phh.Planillas_idPlanillas =
                            p.idPlanillas
                    )

                    -

                    (
                        SELECT IFNULL(
                            SUM(phd.montoDescuento),
                            0
                        )

                        FROM Planillas_has_Descuentos phd

                        WHERE phd.Planillas_idPlanillas =
                            p.idPlanillas
                    )

                ) AS liquido

            FROM Planillas p

            INNER JOIN Users u
                ON p.Users_idUsers =
                u.idUsers

            INNER JOIN anioPlanillas a
                ON p.anioPlanillas_idanioPlanillas =
                a.idanioPlanillas

            INNER JOIN mesPlanillas m
                ON p.mesPlanillas_idmesPlanillas =
                m.idmesPlanillas

            INNER JOIN tipoPlanillas tp
                ON tp.idtipoPlanilla =
                p.tipoPlanillas_idtipoPlanilla

            WHERE
                p.Users_idUsers = ?
                AND
                (
                    ${condiciones}
                )

            ORDER BY
                a.nameAnioPlanilla ASC,
                m.idmesPlanillas ASC

        `);

        return stmt.all(...params);

    }

    close(){
        this.db.close();
        console.log("db closed");
    }
}
export default AppDatabase;