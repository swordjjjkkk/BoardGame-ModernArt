// module.exports = function(app) {
//   return new Handler(app);
// };
//
// var Handler = function(app) {
//   this.app = app;
// };
//
// /**
//  * New client entry.
//  *
//  * @param  {Object}   msg     request message
//  * @param  {Object}   session current session object
//  * @param  {Function} next    next step callback
//  * @return {Void}
//  */
// Handler.prototype.entry = function(msg, session, next) {
//   next(null, {code: 200, msg: 'game server is ok.'});
// };
//
// /**
//  * Publish routes for mqtt connector.
//  *
//  * @param  {Object}   msg     request message
//  * @param  {Object}   session current session object
//  * @param  {Function} next    next step callback
//  * @return {Void}
//  */
// Handler.prototype.publish = function(msg, session, next) {
// 	var result = {
// 		topic: 'publish',
// 		payload: JSON.stringify({code: 200, msg: 'publish message is ok.'})
// 	};
//   next(null, result);
// };
//
// /**
//  * Subscribe routes for mqtt connector.
//  *
//  * @param  {Object}   msg     request message
//  * @param  {Object}   session current session object
//  * @param  {Function} next    next step callback
//  * @return {Void}
//  */
// Handler.prototype.subscribe = function(msg, session, next) {
// 	var result = {
// 		topic: 'subscribe',
// 		payload: JSON.stringify({code: 200, msg: 'subscribe message is ok.'})
// 	};
//   next(null, result);
// };


module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function (msg, session, next) {
    var self = this;

    var uid = msg.username;
    var sessionService = self.app.get('sessionService');

    //duplicate log ingetByUid
    if (!!sessionService.getByUid(uid)) {
        next(null, {
            code: 500,
            error: true
        });
        return;
    }

    session.bind(uid);
    // session.set('rid', rid);
    // session.push('rid', function(err) {
    //     if(err) {
    //         console.error('set rid for session service failed! error is : %j', err.stack);
    //     }
    // });
    // session.on('closed', onUserLeave.bind(null, self.app));

    next(null, {
        result: 'success'
    });

    //put user into channel
    // self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function(users){
    //     next(null, {
    //         users:users
    //     });
    // });
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function (app, session) {
    if (!session || !session.uid) {
        return;
    }
    app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};
