const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../db');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

function getFilePath(collection) {
    return path.join(DB_DIR, `${collection}.json`);
}
function readCollection(collection) {
    const file = getFilePath(collection);
    if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeCollection(collection, data) {
    fs.writeFileSync(getFilePath(collection), JSON.stringify(data, null, 2));
}

const db = {
    find(collection, query = {}) {
        const data = readCollection(collection);
        return data.filter(item =>
            Object.entries(query).every(([k, v]) => item[k] === v)
        );
    },
    findOne(collection, query = {}) {
        return this.find(collection, query)[0] || null;
    },
    findById(collection, id) {
        return readCollection(collection).find(item => item._id === id) || null;
    },
    insert(collection, record) {
        const data = readCollection(collection);
        const newRecord = {
            _id: Date.now().toString(36) + Math.random().toString(36).slice(2),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...record,
        };
        data.push(newRecord);
        writeCollection(collection, data);
        return newRecord;
    },
    updateById(collection, id, updates) {
        const data = readCollection(collection);
        const idx = data.findIndex(item => item._id === id);
        if (idx === -1) return null;
        data[idx] = { ...data[idx], ...updates, updatedAt: new Date().toISOString() };
        writeCollection(collection, data);
        return data[idx];
    },
    deleteById(collection, id) {
        const data = readCollection(collection);
        const filtered = data.filter(item => item._id !== id);
        writeCollection(collection, filtered);
        return filtered.length < data.length;
    },
    count(collection, query = {}) {
        return this.find(collection, query).length;
    },
};

module.exports = db;