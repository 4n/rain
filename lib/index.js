var http = require('http'),
    path = require('path'),
    _ = require('lodash'),
    express = require('express'),
    mongoose = require('mongoose');

var Rain = module.exports = function(options) {
    if (!(this instanceof Rain))
        return new Rain(options);

    this.options = _.defaults({}, options, Rain.defaults);

    var app = this.app = express();

    app.engine('dust', require('consolidate').dust);
    app.set('view engine', 'dust');
    app.set('views', path.join(__dirname, '../views'));
    // TODO: multiple views dir; https://github.com/visionmedia/express/pull/1186

    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('some secret rain'));
    app.use(express.cookieSession({ cookie: { maxAge: 86400 * 10}, key: 'rain' }));
    app.use(express.static(path.join(__dirname, '../public')));

    mongoose.connect(this.options.mongo);

    app.use(app.router);
    this.routes();

    // development
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }
};

Rain.defaults = {
    port: process.env.PORT || 80,
    mongo: process.env.MONGOLAB_URI || 'mongodb://localhost/rain-example' // TODO: use dir name
};

Rain.prototype = {
    run: function() {
        var port = this.options.port;
        http.createServer(this.app).listen(port, function(){
            console.log('Rain started on port ' + port);
        });
    },
    routes: function() {
        this.app.get('/', function(req, res) {
            res.send('Hello World');
        });
    }
};