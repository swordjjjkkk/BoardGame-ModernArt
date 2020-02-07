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
        this.staticcards = JSON.parse(JSON.stringify(staticpoker));
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
        this.money = 100; //资金
        this.buycard = []; //买到的画作
        this.buymoney = 0; //购买画作的钱
        this.host = false; //是否为主持
        this.handcards = [];
        this.actionlist = ["prepare"];
    }

    RemoveCard(id) {
        for (var i in this.handcards) {
            if (this, this.handcards[i].id == id) {
                this.handcards.splice(i, 1);
            }
        }
    }
}


class Room {
    constructor(rid, playernum, session, pomelo, next) {
        this.flag = true;
        this.pomelo = pomelo
        this.rid = rid;
        this.poker = new Poker();

        this.playercount = 0
        //this.playerlist = [];//存玩家session

        //游戏状态
        this.gamestate = {
            state: "wating",// wating  running
            playernum: parseInt(playernum),
            playerlist: [],//new Player
            turn: 'all', //uid  all
            action: 'sell',//sell buy
            sellcard: [],//new Card


        };


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
        for (var i in this.gamestate.playerlist) {
            if (this.gamestate.playerlist[i].userid == uid) {
                return this.gamestate.playerlist[i];
            }
        }
        return null;
    }

    SetNextPlayerTurn(uid, actionlist) {
        for (var i=0;i<this.gamestate.playerlist.length;i++) {
            if (this.gamestate.playerlist[i].userid == uid) {
                var pos = (i + 1) % this.gamestate.playerlist.length;
                this.gamestate.turn = this.gamestate.playerlist[pos].userid;
                this.gamestate.playerlist[pos].actionlist = actionlist;
                return;
            }
        }
        return;
    }

    GameStart() {

        this.gamestate.state = 'running';
        var pos = Math.floor(Math.random() * this.gamestate.playerlist.length);
        this.gamestate.turn = this.gamestate.playerlist[pos].userid;
        this.gamestate.playerlist[pos].actionlist.push("sellcard");
        this.poker.Shuffle();
        for (var i in this.gamestate.playerlist) {
            if (this.gamestate.playernum == 3) {
                // var param = {
                //     route: 'onAddCard',
                //     cards: this.poker.staticcards.splice(0, 11)
                //
                // }
                // this.PlayerPushMessage(param, this.gamestate.playerlist[i].userid, this.gamestate.playerlist[i].frontendId)
                this.gamestate.playerlist[i].handcards = this.poker.staticcards.splice(0, 11);

            }
            if (this.gamestate.playernum == 4) {
                // var param = {
                //     route: 'onAddCard',
                //     cards: this.poker.staticcards.slice(0, 9)
                // }
                // this.PlayerPushMessage(param, this.gamestate.playerlist[i].userid, this.gamestate.playerlist[i].frontendId)
                this.gamestate.playerlist[i].handcards = this.poker.staticcards.splice(0, 9);
            }
            if (this.gamestate.playernum == 5) {
                // var param = {
                //     route: 'onAddCard',
                //     cards: this.poker.staticcards.slice(0, 8)
                // }
                // this.PlayerPushMessage(param, this.gamestate.playerlist[i].userid, this.gamestate.playerlist[i].frontendId)
                this.gamestate.playerlist[i].handcards = this.poker.staticcards.splice(0, 8);
            }
        }
    }

    CheckReady() {
        var temp = 0;
        for (var i in this.gamestate.playerlist) {
            if (this.gamestate.playerlist[i].ready) {
                temp++;
            }
        }
        this.GameStart();
        if (temp == this.gamestate.playernum && this.gamestate.state == 'wating') {
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

    GameSynData() {
        this.RoomPushMessage({
            route: 'GameNotify',
            data: this.gamestate
        });
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
        var flag = false;
        for (var i in this.gamestate.playerlist) {
            if (this.gamestate.playerlist[i].uid == session.uid){
                flag = true;
            }

        }
        if (!flag){
            this.gamestate.playerlist.push(new Player(session));
        }

        next(null, {
            result: 'success',
            playernum: this.gamestate.playernum
        });
        this.GameSynData();


    }


}

module.exports = function (app) {

    return new Handler(app);
};


var handler = Handler.prototype;
handler.roomlist = [];
/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */


handler.GameAction = function (msg, session, next) {
    next(null, {
        content: 'received'
    });
    var room = GetRoom(session.get('rid'));
    var player = room.GetPlayer(session.uid);
    if ((room.gamestate.turn == session.uid || room.gamestate.turn == "all") && (player.actionlist.indexOf(msg.type) != -1)) {
        player.actionlist.splice(0, player.actionlist.length);  //执行一个action就清空actionlist，然后根据具体代码来决定能否执行其他action
        switch (msg.type) {
            case "prepare":


                player.ready = true;
                room.CheckReady();
                break;
            case "sellcard":


                for (var i in msg["data"]) {
                    room.gamestate.sellcard.push(staticpoker[msg["data"][i]]);
                    player.RemoveCard(msg["data"][i]);
                }
                room.SetNextPlayerTurn(session.uid, ["buycard"]);
                break;
            case "buycard":
                player.buymoney = parseInt(msg["data"]);
                room.SetNextPlayerTurn(session.uid, ["deal"]);
                break;
            case "deal":
                var pos;
                pos=0;
                for(var i in room.gamestate.playerlist)
                {
                    if(room.gamestate.playerlist[i].buymoney>room.gamestate.playerlist[pos].buymoney)
                    {
                        pos=i;
                    }
                }
                room.gamestate.playerlist[pos].money-=room.gamestate.playerlist[pos].buymoney;
                player.money+=room.gamestate.playerlist[pos].buymoney;
                for(var i in room.gamestate.sellcard)
                {
                    room.gamestate.playerlist[pos].buycard.push(room.gamestate.sellcard[i]);
                }
                room.gamestate.sellcard=[];
                room.SetNextPlayerTurn(session.uid,["sellcard"]);
                break;
            default:
                break;

        }
        room.GameSynData();
    }


}
handler.GetPlayerNum = function (msg, session, next) {
    next(null, {
        playernum: GetRoom(session.get('rid')).gamestate.playernum
    });
}

handler.GetGameState = function (msg, session, next) {
    next(null, {
        content: 'received'
    });
    //具体操作

    GetRoom(session.get("rid")).GameSynData();
    ;

}

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

