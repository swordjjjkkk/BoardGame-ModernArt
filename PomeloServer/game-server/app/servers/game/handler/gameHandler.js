var logger = require('pomelo-logger').getLogger('pomelo', __filename);

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

var handler = Handler.prototype;

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.prepare = function(msg, session, next) {
    var rid = session.get('rid');
    var username = session.uid.split('*')[0];
    var channelService = this.app.get('channelService');
    channel = channelService.getChannel(rid, false);

    next(null, {
        content:'already prepared'
    });
};
