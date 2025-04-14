const db = require('../conexao/db');

const Product = {
    getAllProducts: (callback) => {
        const sql = 'SELECT * FROM mercadoria';
        db.query(sql, (err, results) => {
            if (err) throw err;
            callback(results);
        });
    },

    getAllProductsToPDF: () => {
        const sql = 'SELECT * FROM mercadoria';
        return new Promise((resolve, reject) => {
            db.query(sql, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
};

module.exports = Product;
