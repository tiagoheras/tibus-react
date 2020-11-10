const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    db.run('DROP TABLE IF EXISTS Catalogo');
    db.run('CREATE TABLE Catalogo (id INTEGER PRIMARY KEY NOT NULL, sku TEXT NOT NULL, nombre TEXT NOT NULL, precio_actual INTEGER NOT NULL, precio_anterior INTEGER NOT NULL, sexo TEXT NOT NULL, img BLOB NOT NULL)');
})

db.serialize(() => {
    db.run('DROP TABLE IF EXISTS Talles');
    db.run('CREATE TABLE Talles (id INTEGER NOT NULL PRIMARY KEY, item_sku INTEGER NOT NULL, talle INTEGER NOT NULL, cantidad INTEGER NOT NULL DEFAULT 1, FOREIGN KEY(item_sku) REFERENCES Catalogo(sku))')
}) 