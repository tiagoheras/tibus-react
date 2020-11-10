const express = require('express');
const tallesRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

tallesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Talles WHERE Talles.item_sku = $itemSKU ORDER BY talle ASC', {
        $itemSKU: req.params.itemSKU
    }, (err, talles) => {
        if (err) {
            next(err)
            console.log(err);
        } else {
            res.status(200).json({ talles: talles })
        }
    })
})

tallesRouter.post('/', (req, res, next) => {
    req.body.talles.forEach(item => {
        const talle = item.talle,
            cantidad = item.cantidad,
            itemSKU = req.params.itemSKU;
        db.get('SELECT * FROM Catalogo WHERE Catalogo.sku = $itemSKU', {
            $itemSKU: itemSKU
        }, (err, catalogoItem) => {
            if (err) {
                next(err)
            } else {
                if (!talle || !cantidad || !catalogoItem) {
                    res.status(400)
                }
            }
            db.run('INSERT INTO Talles (talle, cantidad, item_sku) VALUES ($talle, $cantidad, $itemSKU)', {
                $talle: talle,
                $cantidad: cantidad,
                $itemSKU: itemSKU
            }, function (err) {
                if (err) {
                    next(err)
                } else {
                    db.get('SELECT * FROM Talles WHERE Talles.item_sku = $itemSKU', (err, talles) => {
                        res.status(201).send(talles);
                    })
                }
            })
        })
    })
})

tallesRouter.param('talleId', (req, res, next, talleId) => {
    db.get('SELECT * FROM Talles WHERE id = $talleId', {
        $talleId: talleId
    }, (err, talle) => {
        if (err) {
            next(err)
        } else if (talle) {
            req.talle = talle;
            next()
        } else {
            res.sendStatus(404)
        }
    })
})

tallesRouter.get('/:talleId', (req, res, next) => {
    res.status(200).json({ talle: req.talle })
})

tallesRouter.put('/:talleId', (req, res, next) => {
    const talle = req.body.talles.talle,
        cantidad = req.body.talles.cantidad,
        itemId = req.body.talles.itemId;
    db.get('SELECT * FROM Catalogo WHERE Catalogo.id = $itemId', {
        $itemId: itemId
    }, (err, catalogoItem) => {
        if (err) {
            next(err)
        } else {
            if (!talle || !cantidad || !catalogoItem) {
                res.sendStatus(400)
            }
        }
        db.run('UPDATE Talles SET talle = $talle, cantidad = $cantidad, item_id = $itemId WHERE Talles.id = $talleId', {
            $talle: talle,
            $cantidad: cantidad,
            $itemId: itemId,
            $talleId: req.params.talleId
        }, function (err) {
            if (err) {
                next(err)
            } else {
                db.get('SELECT * FROM Talles WHERE id = $talleId', (err, talle) => {
                    res.status(200).json({ talle: talle })
                })
            }
        })
    })
})

tallesRouter.delete('/:talleId', (req, res, next) => {
    db.run('DELETE FROM Talles WHERE Talles.id = $talleId', {
        $talleId: req.params.talleId
    }, function (err) {
        if (err) {
            next(err)
        } else {
            res.sendStatus(204)
        }
    })
})

module.exports = tallesRouter;