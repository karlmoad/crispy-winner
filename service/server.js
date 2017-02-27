'use strict';

const Http = require('http');
const Express = require('express');
const BodyParser = require('body-parser');
const cors = require('cors');
const Swaggerize = require('swaggerize-express');
const Path = require('path');

const App = Express();

const Server = Http.createServer(App);


// TODO rework cors allow rules for production wildcard not appropriate
App.use(cors());
App.options("*",cors());

App.use(BodyParser.json());
App.use(BodyParser.urlencoded({
    extended: true
}));

App.use(Swaggerize({
    api: Path.resolve('./config/swagger.yaml'),
    handlers: Path.resolve('./handlers')
}));

Server.listen(31000, function () {
    App.swagger.api.host = this.address().address + ':' + this.address().port;
    /* eslint-disable no-console */
    console.log('App running on %s:%d', this.address().address, this.address().port);
    /* eslint-disable no-console */
});
