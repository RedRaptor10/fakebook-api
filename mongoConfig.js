const mongoose = require('mongoose');
const nconf = require('nconf');

// Set up nconf
nconf.argv().env().file({ file: './config.json' });

// Set up mongoose connection
var mongoDB = 'mongodb+srv://' + nconf.get('MONGODB_USERNAME') + ':' + nconf.get('MONGODB_PASSWORD')
  + '@cluster0.keq1q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));