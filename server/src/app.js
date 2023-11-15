const path = require('path');
const api = require('./api.js');
const cors = require('cors');

const { main } = require("./database.js");

// Détermine le répertoire de base
const basedir = path.normalize(path.dirname(__dirname));
console.debug(`Base directory: ${basedir}`);

express = require('express');
const app = express()
api_1 = require("./api.js");
const session = require("express-session");

const corsOptions = {
  origin: true,
  credentials: true,
}
app.use(cors(corsOptions));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(session({
    name: "cookie_twister",
    secret: "cookie magique",
    saveUnInitialized: true,
    cookie : {
      maxAge : 60000 * 60 * 24 //1 jour
    }
}));

(async () => {
    const db = await main();
    app.use('/api', api.default(db));
})();

// Démarre le serveur
app.on('close', () => {
});
exports.default = app;
