const express = require('express');
const singleTalleRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

singleTalleRouter.param('talleNumber', (req, res, next, talleNumber) => {
    db.all('SELECT Catalogo.id, Catalogo.sku, Catalogo.nombre, Catalogo.precio_actual, Catalogo.precio_anterior, Catalogo.sexo, Catalogo.img FROM Catalogo, Talles WHERE Talles.talle = $talleNumber AND Catalogo.sku = Talles.item_sku AND sexo = $sexo', {
        $talleNumber: talleNumber,
        $sexo: req.params.sexo
    }, (err, catalogoItems) => {
        if (err) {
            next(err)
        } else if (catalogoItems) {
            req.catalogoItems = catalogoItems;
            next();
        } else {
            res.sendStatus(404);
        }
    })
})

singleTalleRouter.get('/:talleNumber', (req, res, next) => {
    res.status(200).json({ catalogoItems: req.catalogoItems })
})


module.exports = singleTalleRouter;