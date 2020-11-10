const express = require('express');
const catalogoRouter = express.Router();
const tallesRouter = require('./talles');

const slqite3 = require('sqlite3');
const singleTalleRouter = require('./singleTalle');
const db = new slqite3.Database('./database.sqlite');

catalogoRouter.use('/:itemSKU/talles', tallesRouter);
catalogoRouter.use('/filtro/talle', singleTalleRouter)

catalogoRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Catalogo', (err, catalogoItems) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ catalogoItems: catalogoItems })
        }
    })
})

catalogoRouter.get('/filtro', (req, res, next) => {
    const sexo = req.query.sexo,
        talle = req.query.talle;
    if (talle && sexo) {
        return db.all('SELECT Catalogo.id, Catalogo.sku, Catalogo.nombre, Catalogo.precio_actual, Catalogo.precio_anterior, Catalogo.sexo, Catalogo.img FROM Catalogo, Talles WHERE Talles.talle = $talle AND Catalogo.sku = Talles.item_sku AND sexo = $sexo', {
            $talle: talle,
            $sexo: sexo
        }, (err, catalogoItems) => {
            if (err) {
                next(err);
            } else {
                res.status(200).json({ catalogoItems: catalogoItems })
            }
        })
    } else if (!talle && sexo) {
        return db.all('SELECT * FROM Catalogo WHERE sexo = $sexo', {
            $sexo: sexo,
        }, (err, catalogoItems) => {
            if (err) {
                next(err)
            } else {
                res.status(200).json({ catalogoItems: catalogoItems })
            }
        })
    } else if (talle && !sexo) {
        return db.all('SELECT Catalogo.id, Catalogo.sku, Catalogo.nombre, Catalogo.precio_actual, Catalogo.precio_anterior, Catalogo.sexo, Catalogo.img FROM Catalogo, Talles WHERE Talles.talle = $talle AND Catalogo.sku = Talles.item_sku', {
            $talle: talle,
        }, (err, catalogoItems) => {
            if (err) {
                next(err);
            } else {
                res.status(200).json({ catalogoItems: catalogoItems });
            }
        })
    } else {
        res.status(400).send('opa');
    }
})

catalogoRouter.post('/', (req, res, next) => {
    const sku = req.body.catalogoItem.sku,
        nombre = req.body.catalogoItem.nombre,
        precioActual = req.body.catalogoItem.precioActual,
        precioAnterior = req.body.catalogoItem.precioAnterior,
        sexo = req.body.catalogoItem.sexo,
        img = req.body.catalogoItem.img;
    if (!sku || !nombre || !precioActual || !precioAnterior || !sexo || !img) {
        return res.status(400).send('faltan datos animal');
    }

    db.run('INSERT INTO Catalogo (sku, nombre, precio_actual, precio_anterior, sexo, img) VALUES ($sku, $nombre, $precioActual, $precioAnterior, $sexo, $img)', {
        $sku: sku,
        $nombre: nombre,
        $precioActual: precioActual,
        $precioAnterior: precioAnterior,
        $sexo: sexo,
        $img: img,
    }, function (err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Catalogo WHERE id = ${this.lastID}`, (err, newCatalogoItem) => {
                res.status(200).json({ catalogoItem: newCatalogoItem });
            })
        }
    })
})

catalogoRouter.param('itemSKU', (req, res, next, itemSKU) => {
    db.get('SELECT * FROM Catalogo WHERE sku = $itemSKU', {
        $itemSKU: itemSKU
    }, (err, catalogoItem) => {
        if (err) {
            next(err)
        } else if (catalogoItem) {
            req.catalogoItem = catalogoItem;
            next();
        } else {
            res.sendStatus(404);
        }
    })
})

catalogoRouter.get('/:itemSKU', (req, res, next) => {
    res.status(200).json({ catalogoItem: req.catalogoItem })
})

catalogoRouter.get('/:itemSKU/more', (req, res, next) => {
    db.all('SELECT * FROM Catalogo WHERE sexo = $sexo EXCEPT SELECT * FROM Catalogo WHERE sku = $sku', {
        $sku: req.catalogoItem.sku,
        $sexo: req.catalogoItem.sexo
    }, (err, catalogoItems) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({ catalogoItems: catalogoItems })
        }
    })
})

catalogoRouter.put('/:itemSKU', (req, res, next) => {
    const sku = req.body.catalogoItem.sku,
        nombre = req.body.catalogoItem.nombre,
        precioActual = req.body.catalogoItem.precioActual,
        precioAnterior = req.body.catalogoItem.precioAnterior,
        sexo = req.body.catalogoItem.sexo
    img = req.file.buffer;
    if (!sku || !nombre || !precioActual || !precioAnterior || !sexo) {
        res.status(400).send('te falta data para actualizar maquina');
    }
    db.run('UPDATE Catalogo SET sku = $sku, nombre = $nombre, precio_actual = $precioActual, precio_anterior = $precioAnterior, sexo = $sexo, img = $img WHERE sku = $itemSKU', {
        $sku: sku,
        $nombre: nombre,
        $precioActual: precioActual,
        $precioAnterior: precioAnterior,
        $sexo: sexo,
        $img: img,
        $itemSKU: req.params.itemSKU
    }, function (err) {
        if (err) {
            next(err);
        } else {
            db.get('SELECT * FROM Catalogo WHERE sku = $itemSKU', (err, updatedCatalogoItem) => {
                res.status(200).json({ catalogoItem: updatedCatalogoItem })
            })
        }
    })
})

catalogoRouter.delete('/:itemSKU', (req, res, next) => {
    db.run('DELETE FROM Catalogo WHERE sku = $itemSKU', {
        $itemSKU: req.params.itemSKU
    }, function (err) {
        if (err) {
            next(err)
        } else {
            res.status(204).send('elimina3');
        }
    })
})

module.exports = catalogoRouter;