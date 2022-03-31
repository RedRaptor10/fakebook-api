const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

async function startMongoServer() {
    mongoServer = await MongoMemoryServer.create(); // Start Mongo server
    const mongoUri = mongoServer.getUri();

    mongoose.connect(mongoUri);

    mongoose.connection.on('error', e => {
        if (e.message.code === 'ETIMEDOUT') {
            console.log(e);
            mongoose.connect(mongoUri);
        }
        console.log(e);
    });

    mongoose.connection.once('open', () => {
        console.log(`MongoDB successfully connected to ${mongoUri}`);
    });
}

async function stopMongoServer() {
    mongoose.connection.close(); // Close Mongoose connection
    mongoServer.stop(); // Stop Mongo server
}

module.exports = { startMongoServer, stopMongoServer };