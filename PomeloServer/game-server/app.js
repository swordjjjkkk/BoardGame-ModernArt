var pomelo = require('pomelo');
var routeUtil = require('./app/util/routeUtil');
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'ModernArtServer');

// app configuration
app.configure('production|development', function () {
    // routes configures
    app.route('chat', routeUtil.chat);
    app.set('connectorConfig',
        {
            connector : pomelo.connectors.hybridconnector,
            // 'websocket', 'polling-xhr', 'polling-jsonp', 'polling'
            heartbeat : 3
        });
    // filter configures
    app.filter(pomelo.timeout());
});

// start app
app.start();

process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
});
