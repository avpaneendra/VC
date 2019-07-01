const Symple = require('symple');
const sy = new Symple();
const express = require('express');
const path = require('path');
const redis = require('redis');
const client = redis.createClient();
const app = express();
const config = require('./config');

sy.loadConfig(path.join(__dirname, '/symple.config.json')); // see symple.config.json for options
sy.init();
console.log('Symple server listening on port ' + sy.config.port);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname , '/'));
app.use(express.static(path.join(__dirname , '/vendor_assets')));
app.use(express.static(path.join(__dirname , '/assets')));
app.use(express.static(path.join(__dirname , '/node_modules/symple-client/src')));
app.use(express.static(path.join(__dirname , '/node_modules/symple-client-player/src')));

app.get('/', function (req, res) {
    // Create a random token to identify this client
    const token = Math.random().toString(36).slice(2) + Date.now();

    // Create the arbitrary user session object here
    const session = {
        // user: 'demo',
        // name: 'Demo User',
        group: 'public'
    };

    // Store the user session on Redis
    // This will be sent to the Symple server to authenticate the session
    client.set('symple:session:' + token, JSON.stringify(session), redis.print);

    // Render the response
    res.render('index', {
        socketHost: config.socket_host,
        token: token,
        peer: session
    });
});

app.listen(config.port, function () {
    console.log('Server listening on port ' + config.port);
});
