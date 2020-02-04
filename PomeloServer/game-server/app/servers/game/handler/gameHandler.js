var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var Handler = function (app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

function GetRoom(rid) {
    for (var i in handler.roomlist) {
        if (handler.roomlist[i].rid == rid) {
            return handler.roomlist[i]
        }
    }
    return null
}

class Card {
    constructor(id, priority, type) {
        this.id = id;
        this.priority = priority;
        this.type = type;
    }
}

const staticpoker = [
    new Card(0, 1, 1), new Card(1, 1, 1), new Card(2, 1, 1), new Card(3, 1, 2)
    , new Card(4, 1, 2), new Card(5, 1, 3), new Card(6, 1, 3), new Card(7, 1, 4)
    , new Card(8, 1, 4), new Card(9, 1, 5), new Card(10, 1, 5), new Card(11, 1, 5)
    , new Card(12, 2, 1), new Card(13, 2, 1), new Card(14, 2, 1), new Card(15, 2, 2)
    , new Card(16, 2, 2), new Card(17, 2, 3), new Card(18, 2, 3), new Card(19, 2, 3)
    , new Card(20, 2, 4), new Card(21, 2, 4), new Card(22, 2, 4), new Card(23, 2, 5)
    , new Card(24, 2, 5), new Card(25, 3, 1), new Card(26, 3, 1), new Card(27, 3, 1)
    , new Card(28, 3, 2), new Card(29, 3, 2), new Card(30, 3, 3), new Card(31, 3, 3)
    , new Card(32, 3, 3), new Card(33, 3, 4), new Card(34, 3, 4), new Card(35, 3, 4)
    , new Card(36, 3, 5), new Card(37, 3, 5), new Card(38, 3, 5), new Card(39, 4, 1)
    , new Card(40, 4, 1), new Card(41, 4, 1), new Card(42, 4, 2), new Card(43, 4, 2)
    , new Card(44, 4, 2), new Card(45, 4, 3), new Card(46, 4, 3), new Card(47, 4, 3)
    , new Card(48, 4, 4), new Card(49, 4, 4), new Card(50, 4, 4), new Card(51, 4, 5)
    , new Card(52, 4, 5), new Card(53, 4, 5), new Card(54, 5, 1), new Card(55, 5, 1)
    , new Card(56, 5, 1), new Card(57, 5, 1), new Card(58, 5, 2), new Card(59, 5, 2)
    , new Card(60, 5, 2), new Card(61, 5, 3), new Card(62, 5, 3), new Card(63, 5, 3)
    , new Card(64, 5, 4), new Card(65, 5, 4), new Card(66, 5, 4), new Card(67, 5, 5)
    , new Card(68, 5, 5), new Card(69, 5, 5)
]


class Poker {
    constructor() {
        this.staticcards = staticpoker;


    }


    SwapCard(pos1, pos2) {
        var temp = this.staticcards[pos1];
        this.staticcards[pos1] = this.staticcards[pos2];
        this.staticcards[pos2] = temp;
    }

    Shuffle() {
        this.staticcards = staticpoker;
        var pos1;
        for (var i = 1; i < 70; i++) {

            pos1 = Math.floor(Math.random() * (70 - i + 1));
            this.SwapCard(pos1, 70 - i);
        }

    }
}

class Player {
    constructor(session) {
        this.userid = session.uid;
        this.frontendId = session.frontendId;
        this.ready = false;
        this.money = 100;
    }
}

class Room {
    constructor(rid, playernum, session, pomelo, next) {
        this.flag = true;
        this.pomelo = pomelo
        this.rid = rid;
        this.poker = new Poker();
        this.playernum = playernum;
        this.playercount = 0
        this.playerlist = [];//存玩家session

        var room = this.pomelo.app.get('channelService').getChannel(this.rid, false);
        if (!!room) {
            next(null, {
                result: 'failed', msg: 'room already exist'
            });
            this.flag = false;
            return
        } else {
            this.pomelo.app.get('channelService').getChannel(this.rid, true);
        }
        this.JoinRoom(session, next);
    }

    GetPlayer(uid) {
        for (var i in this.playerlist) {
            if (this.playerlist[i].userid == uid) {
                return this.playerlist[i];
            }
        }
        return null;
    }

    GameStart() {
        this.RoomPushMessage({route: 'onGameStart', money: "100"});
        this.poker.Shuffle();
        for (var i in this.playerlist) {
            if (parseInt(this.playernum) == 3) {
                var param = {
                    route: 'onAddCard',
                    cards: this.poker.staticcards.splice(0, 11)

                }
                this.PlayerPushMessage(param, this.playerlist[i].userid, this.playerlist[i].frontendId)

            }
            if (parseInt(this.playernum) == 4) {
                var param = {
                    route: 'onAddCard',
                    cards: this.poker.staticcards.slice(0, 9)
                }
                this.PlayerPushMessage(param, this.playerlist[i].userid, this.playerlist[i].serverid)
            }
            if (parseInt(this.playernum) == 5) {
                var param = {
                    route: 'onAddCard',
                    cards: this.poker.staticcards.slice(0, 8)
                }
                this.PlayerPushMessage(param, this.playerlist[i].userid, this.playerlist[i].serverid)
            }
        }
    }

    CheckReady() {
        var temp = 0;
        for (var i in this.playerlist) {
            if (this.playerlist[i].ready) {
                temp++;
            }
        }
        // this.GameStart();
        if (temp == parseInt(this.playernum)) {
            this.GameStart();
        }
    }

    PlayerPushMessage(param, tuid, tsid) {
        this.pomelo.app.get('channelService').pushMessageByUids(param, [{
            uid: tuid,
            sid: tsid
        }]);
    }

    RoomPushMessage(param) {

        this.pomelo.app.get('channelService').getChannel(this.rid, false).pushMessage(param);
    }

    JoinRoom(session, next) {

        var channel = this.pomelo.app.get('channelService').getChannel(this.rid, false);


        channel.add(session.uid, session.frontendId);
        session.set('rid', this.rid);
        session.push('rid', function (err) {
            if (err) {
                console.error('set rid for session service failed! error is : %j', err.stack);
            }
        });

        this.playerlist.push(new Player(session));
        next(null, {
            result: 'success',
            playernum: this.playernum
        });


    }

}

module.exports = function (app) {

    return new Handler(app);
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

    // var channel = this.channelService.getChannel(session.get('rid'), false);
    //
    // var param = {
    // 	route: 'onGameStart',
    // 	user: ""
    // };
    // channel.pushMessage(param);

    next(null, {
        content: 'already prepared'
    });
    var room = GetRoom(session.get('rid'));
    var player = room.GetPlayer(session.uid);
    player.ready = true;
    room.CheckReady();

};

handler.CreateRoom = function (msg, session, next) {
    var room = new Room(msg.rid, msg.playernum, session, this, next);
    if (room.flag)
        this.roomlist.push(room)
}

handler.JoinRoom = function (msg, session, next) {
    var room = GetRoom(msg.rid)
    if (!!room) {
        room.JoinRoom(session, next)
    }
};