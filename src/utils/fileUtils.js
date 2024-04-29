const fs = require('fs');

function leerArchivo(filename, encoding) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, encoding, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function escribirArchivo(filename, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports = { leerArchivo, escribirArchivo };

