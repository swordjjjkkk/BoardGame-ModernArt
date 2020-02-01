var logger = require('pomelo-logger').getLogger('pomelo', __filename);

class Poker {

}

class Room {
    constructor(rid) {
        this.rid = rid;
        this.poker = new Poker();
        this.playernum = 0;
        this.playerlist = [];//存玩家session
    }

    pushMessage() {

    }
}

module.exports = function (app) {

    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;
handler.roomlist = []
/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.prepare = function (msg, session, next) {


    next(null, {
        content: 'already prepared'
    });
};

handler.CreateRoom = function (msg, session, next) {
    var self=this;
    var channelService = this.app.get('channelService');
    var channel = channelService.getChannel(msg.rid, true);
    if (!!channel) {
        channel.add(session.uid, self.app.get('serverId'));
        session.set('rid', msg.rid);
        session.push('rid', function (err) {
            if (err) {
                console.error('set rid for session service failed! error is : %j', err.stack);
            }
        });
    } else {
        next(null, {
            result: 'failed', msg: 'room already exist'
        });
        return;
    }
    next(null, {
        result: 'success'
    });
}

handler.JoinRoom = function (msg, session, next) {
    var self = this;
    var roomnum = msg.roomnum;
    var playernum = msg.playernum;
    var sessionService = self.app.get('sessionService');

};
