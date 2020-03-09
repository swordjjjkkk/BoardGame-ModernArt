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
        this.owner = '';
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
        // var pos1;
        // for (var i = 1; i < 70; i++) {
        //
        //     pos1 = Math.floor(Math.random() * (70 - i + 1));
        //     this.SwapCard(pos1, 70 - i);
        // }


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
        this.playermsg = "";
        this.buyover = false;
    }

    RePlay() {
        this.ready = false;
        this.money = 100; //资金
        this.buycard = []; //买到的画作
        this.buymoney = 0; //购买画作的钱
        this.host = false; //是否为主持
        this.handcards = [];
        this.actionlist = ["prepare"];
        this.playermsg = "";
        this.buyover = false;
    }

    RemoveCard(id) {
        for (var i in this.handcards) {
            if (this, this.handcards[i].id == id) {
                this.handcards.splice(i, 1);
            }
        }
    }

    GetCard(id) {
        for (var i in this.handcards) {
            if (this, this.handcards[i].id == id) {
                return this.handcards[i];
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
            state: "waiting",// waiting  running
            playernum: parseInt(playernum),
            playerlist: [],//new Player
            turn: 'all', //uid  all
            action: 'sell',//sell buy
            sellcard: [],//new Card
            commonmsg: "",
            cardvalue: [0, 0, 0, 0, 0],
            round: 1


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
        console.log("GetPlayer return null");
        return null;
    }

    GetHost() {
        for (var i in this.gamestate.playerlist) {
            if (this.gamestate.playerlist[i].host == true) {
                return this.gamestate.playerlist[i];
            }
        }
        console.log("GetHost return null");
        return null;
    }

    GetSellType() {
        if (this.gamestate.sellcard.length == 1) {
            return this.gamestate.sellcard[0].type;
        }
        if (this.gamestate.sellcard.length == 2) {
            if (this.gamestate.sellcard[0].type != 2)
                return this.gamestate.sellcard[0].type;
            else
                return this.gamestate.sellcard[1].type;
        }
        console.log("GetSellType return null");
    }

    SetNextPlayerTurn(uid, actionlist) {
        for (var i = 0; i < this.gamestate.playerlist.length; i++) {
            if (this.gamestate.playerlist[i].userid == uid) {
                var pos = (i + 1) % this.gamestate.playerlist.length;
                this.gamestate.turn = this.gamestate.playerlist[pos].userid;
                this.gamestate.playerlist[pos].actionlist = [...actionlist];
                switch (this.GetSellType()) {
                    case 2:
                        this.gamestate.commonmsg = "联合---" + this.gamestate.turn + "的回合"
                        break;
                    case 4:
                        this.gamestate.commonmsg = "一口价" + this.gamestate.playerlist[0].buymoney + "元---" + this.gamestate.turn + "的回合"
                        break;
                    case 5:
                        this.gamestate.commonmsg = "轮流---" + this.gamestate.turn + "的回合"
                        break;
                    default:
                        break;
                }
                return;
            }
        }
        return;
    }

    SetAllPlayerTurn(actionlist) {
        this.gamestate.turn = "all";
        for (var i = 0; i < this.gamestate.playerlist.length; i++) {

            this.gamestate.playerlist[i].actionlist = [...actionlist];

        }
    }

    SetNextHostTurn(actionlist) {
        var uid = this.GetHost().userid;
        this.SetNextPlayerTurn(uid, actionlist);
    }

    AddHostAction(actions) {

        let host = this.GetHost();
        host.actionlist.push(...actions);


    }

    GameRestart() {
        this.gamestate.state = "waiting";
        this.gamestate.turn = 'all';
        this.gamestate.action = 'sell';
        this.gamestate.sellcard = [];
        this.gamestate.commonmsg = "";
        this.gamestate.cardvalue = [0, 0, 0, 0, 0];
        this.gamestate.round = 1;

        for (var i in this.gamestate.playerlist) {
            this.gamestate.playerlist[i].RePlay();
        }
        this.GameSynData();
    }

    GameStart() {

        this.gamestate.state = 'running';
        var pos = Math.floor(Math.random() * this.gamestate.playerlist.length);
        this.gamestate.turn = this.gamestate.playerlist[pos].userid;
        this.gamestate.commonmsg = this.gamestate.turn + "请出牌";
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
            for (var j in this.gamestate.playerlist[i].handcards) {
                this.gamestate.playerlist[i].handcards[j].owner = this.gamestate.playerlist[i].userid;
            }
        }
    }

    SortSelled() {
        var res = [{priority: 1, count: 0}, {priority: 2, count: 0}, {priority: 3, count: 0}, {
            priority: 4,
            count: 0
        }, {priority: 5, count: 0}];
        for (let i in this.gamestate.playerlist) {
            for (let j in this.gamestate.playerlist[i].buycard) {
                res[this.gamestate.playerlist[i].buycard[j].priority - 1].count++;
            }
        }
        res.sort((a, b) => {
            return b.count - a.count;
        })
        return res;
    }

    GetSellCardCount(priority) {
        var res = 0;
        for (let i in this.gamestate.playerlist) {
            for (let j in this.gamestate.playerlist[i].buycard) {
                if (this.gamestate.playerlist[i].buycard[j].priority == priority) {
                    res++;
                }
            }
        }
        return res;
    }

    RoundOver() {
        var selledcards = this.SortSelled();

        if (selledcards[0].count != 0) {
            this.gamestate.cardvalue[selledcards[0].priority - 1] += 30;
        }
        if (selledcards[1].count != 0) {
            this.gamestate.cardvalue[selledcards[1].priority - 1] += 20;
        }
        if (selledcards[2].count != 0) {
            this.gamestate.cardvalue[selledcards[2].priority - 1] += 10;
        }
        //结算画钱
        for (let i in this.gamestate.playerlist) {
            for (let j in this.gamestate.playerlist[i].buycard) {
                if (this.gamestate.playerlist[i].buycard[j].priority == selledcards[0].priority ||
                    this.gamestate.playerlist[i].buycard[j].priority == selledcards[1].priority ||
                    this.gamestate.playerlist[i].buycard[j].priority == selledcards[2].priority) {
                    this.gamestate.playerlist[i].money += this.gamestate.cardvalue[this.gamestate.playerlist[i].buycard[j].priority - 1];
                }
                this.gamestate.playerlist[i].playermsg = "我挣得xxx元";
            }
        }


        //恢复回合初始，下一个人接着卖

        this.gamestate.commonmsg = "第" + this.gamestate.round + "回合结束，等待下回合开始"
        this.GameSynData();
        this.gamestate.round++;


        setTimeout(() => {
            for (let i in this.gamestate.playerlist) {
                this.gamestate.playerlist[i].buycard = [];
            }

            if (this.gamestate.round == 5) {
                this.GameOver();
                return;
            }
            //补牌
            if (this.gamestate.playernum == 3) {
                switch (this.gamestate.round) {
                    case 1:

                        break;
                    case 2:
                        this.gamestate.playerlist[0].handcards = this.gamestate.playerlist[0].handcards.concat(this.poker.staticcards.splice(0, 6));
                        // this.gamestate.playerlist[1].handcards = this.gamestate.playerlist[1].handcards.concat(this.poker.staticcards.splice(0, 6));
                        // this.gamestate.playerlist[2].handcards = this.gamestate.playerlist[2].handcards.concat(this.poker.staticcards.splice(0, 6));
                        break;
                    case 3:
                        this.gamestate.playerlist[0].handcards = this.gamestate.playerlist[0].handcards.concat(this.poker.staticcards.splice(0, 6));
                        // this.gamestate.playerlist[1].handcards = this.gamestate.playerlist[1].handcards.concat(this.poker.staticcards.splice(0, 6));
                        // this.gamestate.playerlist[2].handcards = this.gamestate.playerlist[2].handcards.concat(this.poker.staticcards.splice(0, 6));
                        break;
                    case 4:
                        //单人测试需要额外补牌，不然无法结束一局
                        this.gamestate.playerlist[0].handcards = this.gamestate.playerlist[0].handcards.concat(this.poker.staticcards.splice(0, 10));
                        break;
                }
            }
            if (this.gamestate.playernum == 4) {
                switch (this.gamestate.round) {
                    case 1:

                        break;
                    case 2:
                        this.gamestate.playerlist[0].handcards = this.gamestate.playerlist[0].handcards.concat(this.poker.staticcards.splice(0, 4));
                        // this.gamestate.playerlist[1].handcards = this.gamestate.playerlist[1].handcards.concat(this.poker.staticcards.splice(0, 4));
                        // this.gamestate.playerlist[2].handcards = this.gamestate.playerlist[2].handcards.concat(this.poker.staticcards.splice(0, 4));
                        // this.gamestate.playerlist[3].handcards = this.gamestate.playerlist[3].handcards.concat(this.poker.staticcards.splice(0, 4));
                        break;
                    case 3:
                        this.gamestate.playerlist[0].handcards = this.gamestate.playerlist[0].handcards.concat(this.poker.staticcards.splice(0, 4));
                        // this.gamestate.playerlist[1].handcards = this.gamestate.playerlist[1].handcards.concat(this.poker.staticcards.splice(0, 4));
                        // this.gamestate.playerlist[2].handcards = this.gamestate.playerlist[2].handcards.concat(this.poker.staticcards.splice(0, 4));
                        // this.gamestate.playerlist[3].handcards = this.gamestate.playerlist[3].handcards.concat(this.poker.staticcards.splice(0, 4));
                        break;
                    case 4:
                        //单人测试需要额外补牌，不然无法结束一局
                        this.gamestate.playerlist[0].handcards = this.gamestate.playerlist[0].handcards.concat(this.poker.staticcards.splice(0, 10));
                        break;
                }
            }
            if (this.gamestate.playernum == 5) {
                switch (this.gamestate.round) {
                    case 1:
                        break;
                    case 2:
                        this.gamestate.playerlist[0].handcards = this.gamestate.playerlist[0].handcards.concat(this.poker.staticcards.splice(0, 3));
                        // this.gamestate.playerlist[1].handcards = this.gamestate.playerlist[1].handcards.concat(this.poker.staticcards.splice(0, 3));
                        // this.gamestate.playerlist[2].handcards = this.gamestate.playerlist[2].handcards.concat(this.poker.staticcards.splice(0, 3));
                        // this.gamestate.playerlist[3].handcards = this.gamestate.playerlist[3].handcards.concat(this.poker.staticcards.splice(0, 3));
                        // this.gamestate.playerlist[4].handcards = this.gamestate.playerlist[4].handcards.concat(this.poker.staticcards.splice(0, 3));
                        break;
                    case 3:
                        this.gamestate.playerlist[0].handcards = this.gamestate.playerlist[0].handcards.concat(this.poker.staticcards.splice(0, 3));
                        // this.gamestate.playerlist[1].handcards = this.gamestate.playerlist[1].handcards.concat(this.poker.staticcards.splice(0, 3));
                        // this.gamestate.playerlist[2].handcards = this.gamestate.playerlist[2].handcards.concat(this.poker.staticcards.splice(0, 3));
                        // this.gamestate.playerlist[3].handcards = this.gamestate.playerlist[3].handcards.concat(this.poker.staticcards.splice(0, 3));
                        // this.gamestate.playerlist[4].handcards = this.gamestate.playerlist[4].handcards.concat(this.poker.staticcards.splice(0, 3));
                        break;
                    case 4:
                        //单人测试需要额外补牌，不然无法结束一局
                        this.gamestate.playerlist[0].handcards = this.gamestate.playerlist[0].handcards.concat(this.poker.staticcards.splice(0, 10));
                        break;
                }
            }
            for (var i in this.gamestate.playerlist) {
                for (var j in this.gamestate.playerlist[i].handcards) {
                    this.gamestate.playerlist[i].handcards[j].owner = this.gamestate.playerlist[i].userid;
                }
            }
            this.gamestate.sellcard = [];
            this.SetNextHostTurn(["sellcard"]);
            this.gamestate.commonmsg = this.gamestate.turn + "请出牌";
            this.GameSynData();
        }, 1000)

    }

    GameOver() {
        var winner;
        winner = this.gamestate.playerlist[0].userid;
        for (var i in this.gamestate.playerlist) {
            if (i > 0) {
                if (this.gamestate.playerlist[i] > this.gamestate.playerlist[i - 1]) {
                    winner = this.gamestate.playerlist[i].userid;
                }
            }

            this.gamestate.playerlist[i].playermsg = "我挣得" + this.gamestate.playerlist[i].money + "元";
        }
        this.gamestate.commonmsg = "Winner is Sogou!!"
        this.GameSynData();
        //恢复现场，开始下一局
        setTimeout(() => {
            this.GameRestart();
        }, 10000);
    }

    SellCard(msg) {
        //判断回合终结
        if (this.gamestate.sellcard.length + this.GetSellCardCount(this.gamestate.sellcard[0].priority) >= 5) {
            this.RoundOver();
            return;
        }
        switch (this.GetSellType()) {
            case 1:  //公开拍卖
                this.SetAllPlayerTurn(["buycard"]);
                this.gamestate.commonmsg = "公开拍卖请竞价"

                break;
            case 2: //联合拍卖

                this.SetNextPlayerTurn(this.GetHost().userid, ["chooseunion"]);
                break;
            case 3://秘密拍卖
                this.SetAllPlayerTurn(["buycard"]);
                this.gamestate.commonmsg = "秘密拍卖请竞价"
                break;
            case 4://一口价拍卖

                for (var p in this.gamestate.playerlist) {
                    this.gamestate.playerlist[p].buymoney = parseInt(msg["money"]);
                }
                this.SetNextPlayerTurn(this.GetHost().userid, ["choose"]);
                break;
            case 5://轮流叫价
                this.SetNextPlayerTurn(this.GetHost().userid, ["buycard"]);

                break;
            default:
                break;
        }
    }

    Deal() {
        var pos = 0;
        var hostpos;
        hostpos = 0;
        for (var m in this.gamestate.playerlist) {
            if (this.gamestate.playerlist[m].host) {
                hostpos = m;
                break;
            }

        }
        pos = hostpos;
        for (var p = hostpos; p < this.gamestate.playerlist.length + hostpos - 1; p++) {

            this.gamestate.playerlist[p % this.gamestate.playerlist.length].playermsg = "出价" + this.gamestate.playerlist[p % this.gamestate.playerlist.length].buymoney + "元";
            if (this.gamestate.playerlist[(p + 1) % this.gamestate.playerlist.length].buymoney > this.gamestate.playerlist[pos].buymoney) {
                pos = (p + 1) % this.gamestate.playerlist.length;
            }
        }
        this.gamestate.commonmsg = this.gamestate.playerlist[pos].userid + "出价" + this.gamestate.playerlist[pos].buymoney + "元,购得此牌";

        setTimeout(() => {
            //减去购买人的钱
            this.gamestate.playerlist[pos].money -= this.gamestate.playerlist[pos].buymoney;
            if (this.gamestate.sellcard.length == 1) {
                console.log(this.gamestate.sellcard[0]);
                if (this.gamestate.sellcard[0].owner == this.gamestate.playerlist[pos].userid) {

                } else {
                    this.GetPlayer(this.gamestate.sellcard[0].owner).money += this.gamestate.playerlist[pos].buymoney;
                }
            }
            if (this.gamestate.sellcard.length == 2) {
                //如果两张牌是同一个人的，且买主也是他自己
                if (this.gamestate.sellcard[0].owner == this.gamestate.playerlist[pos].userid
                    && this.gamestate.sellcard[1].owner == this.gamestate.playerlist[pos].userid) {

                } else {
                    this.GetPlayer(this.gamestate.sellcard[0].owner).money += parseInt(this.gamestate.playerlist[pos].buymoney / 2);
                    this.GetPlayer(this.gamestate.sellcard[1].owner).money += parseInt(this.gamestate.playerlist[pos].buymoney / 2);
                    if (this.gamestate.playerlist[pos].buymoney % 2 == 1) {
                        this.GetHost().money += 1;
                    }
                }


            }


            for (var n in this.gamestate.sellcard) {
                this.gamestate.playerlist[pos].buycard.push(this.gamestate.sellcard[n]);
            }
            this.gamestate.sellcard = [];
            this.SetNextHostTurn(["sellcard"]);
            this.gamestate.commonmsg = this.gamestate.turn + "请出牌";
            for (var k in this.gamestate.playerlist) {
                this.gamestate.playerlist[k].host = false;
                this.gamestate.playerlist[k].buyover = false;
                this.gamestate.playerlist[k].playermsg = "";
                this.gamestate.playerlist[k].buymoney = 0;

            }
            this.GameSynData();
        }, 1000)

    }


    CheckBuyOver() {
        var temp = 0;
        for (var i in this.gamestate.playerlist) {
            if (this.gamestate.playerlist[i].buyover) {
                temp++;
            }
        }
        if (temp == this.gamestate.playerlist.length) {
            for (var j in this.gamestate.playerlist) {
                this.gamestate.playerlist[j].buyover = false;
            }
            this.Deal();
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
        if (temp == this.gamestate.playernum && this.gamestate.state == 'waiting') {
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
            data: JSON.parse(JSON.stringify(this.gamestate))
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
            if (this.gamestate.playerlist[i].userid == session.uid) {
                flag = true;
            }

        }
        if (!flag) {
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
    if ((player.actionlist.indexOf(msg.type) != -1)) {
        for (var i in room.gamestate.playerlist) {
            //执行一个action就清空所有玩家的actionlist，然后根据具体代码来决定能否执行其他action
            room.gamestate.playerlist[i].actionlist.splice(0, room.gamestate.playerlist[i].actionlist.length)
        }
        //player.actionlist.splice();
        switch (msg.type) {
            case "prepare":

                room.SetAllPlayerTurn(["prepare"]);
                player.ready = true;
                room.CheckReady();
                break;
            case "sellcard":
                for (var k in room.gamestate.playerlist) {
                    room.gamestate.playerlist[k].host = false;
                }
                player.host = true;


                for (var j in msg["data"]) {
                    room.gamestate.sellcard.push(player.GetCard(msg["data"][j]));
                    player.RemoveCard(msg["data"][j]);
                }
                room.SellCard(msg);


                break;
            case "buycard":
                player.buymoney = parseInt(msg["data"]);
                player.buyover = true;
                switch (room.GetSellType()) {
                    case 1:  //公开拍卖
                        room.SetAllPlayerTurn(["buycard"]);
                        player.playermsg = player.userid + "出价" + player.buymoney + "元";
                        room.AddHostAction(["deal"]);
                        break;
                    case 2: //联合拍卖
                        break;
                    case 3://秘密拍卖
                        room.SetAllPlayerTurn(["buycard"]);
                        player.playermsg = player.userid + "已出价";
                        room.CheckBuyOver();
                        break;
                    case 4://一口价拍卖
                        break
                    case 5://轮流叫价
                        room.SetNextPlayerTurn(session.uid, ["buycard"]);
                        player.playermsg = player.userid + "出价" + player.buymoney + "元";
                        room.CheckBuyOver();
                        break;
                    default:
                        break;
                }

                break;
            case "choose":
                if (player.host == true) {
                    room.Deal();
                }
                if (msg["data"] == "agree") {
                    for (var l in room.gamestate.playerlist) {
                        if (room.gamestate.playerlist[l].userid != session.uid) {
                            room.gamestate.playerlist[l].buymoney = 0;
                        }
                    }
                    room.Deal();
                } else {
                    player.buymoney = 0;
                    room.SetNextPlayerTurn(session.uid, ["choose"]);
                }
                break;
            case "chooseunion":
                if (player.host) {//无人联合的情况
                    room.Deal();
                } else {
                    if (msg["chooseunion"] == "agree") {
                        for (var w in room.gamestate.playerlist) {
                            room.gamestate.playerlist[w].host = false;
                        }
                        player.host = true;
                        for (var q in msg["data"]) {
                            room.gamestate.sellcard.push(player.GetCard(msg["data"][q]));
                            player.RemoveCard(msg["data"][q]);
                        }
                        room.SellCard(msg);
                    } else {
                        room.SetNextPlayerTurn(session.uid, ["chooseunion"]);
                    }
                }


                break;
            case "deal":
                room.Deal();
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

