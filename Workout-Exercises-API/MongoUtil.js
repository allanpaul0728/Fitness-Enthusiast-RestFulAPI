const MongoClient = require('mongodb').MongoClient;

async function connect(mongoUrl, databaseId) {
    const client = await MongoClient.connect(mongoUrl, {
        useUnifiedTopology: true
    })

    const db = client.db(databaseId);
    return db;
}

module.exports = {connect};