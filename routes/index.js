var socketio = require('socket.io');
var io;
var url = require('url');
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'Express' });
};

exports.populateUsers = function(db) {
	return function(req, res, next) {
		var userId = req.body.userId;
		
		db.query(
			"SELECT * FROM user WHERE user_id <> " + userId,
			function(err, rows) {
				if (err) {
					throw err;
				} else {
					res.json(rows);
				}
			}
		)
	};
};

exports.chat = function(server, db) {
	return function(req, res, next) {
		var queryString = url.parse(req.url, true),
			username = queryString.query.username,
			userId = 0;
			
		// get userId by username
		db.query(
			"SELECT user_id FROM user WHERE username = '" + username + "'",
			function(err, rows) {
				if (err) {
					throw err;
				} else {
					userId = rows[0].user_id;
				}
			}
		)
			
		io = socketio.listen(server);
			
		io.sockets.on('connection', function(socket) {
			
			socket.on('online', function(data) {
				var socketId = socket.id,
					myUserId = data.userId,
					myUsername = data.username;
						
					// set user online
					db.query(
						"UPDATE user SET socket_id = '" + socketId + "' WHERE user_id = " + myUserId,
						function(err) {
							if (err) {
								throw err;
							} else {
										
								var connectedData = {
									'status': true,
									'message': 'connected',
									'socketId': socketId,
									'username': myUsername,
									'userId': myUserId
								};
								
								//socket.broadcast.emit('user_joined',  joinedData);
								socket.emit('connected', connectedData);
								//socket.broadcast.to('lobby').emit('user_joined', joinedData);
								//io.sockets.emit('user_joined', joinedData);										
							}
						}
					)
			});
			
			socket.on('repopulate_users', function() {
				io.sockets.emit('repopulate_users', {});
			});
			
			socket.on('message', function(data) {
				var toUserId = data.toUserId,
					message = data.message,
					fromUserId = data.fromUserId,
					fromUsername = data.fromUsername;
					
				// get socket id
				db.query(
					"SELECT socket_id FROM user WHERE user_id = " + toUserId,
					function(err, rows) {
						if (err) {
							throw err;
						} else {
							var socketId = rows[0].socket_id,
								msgData = {
									fromUserId: fromUserId,
									message: message,
									fromUsername: fromUsername
								};
							
							io.sockets.socket(socketId).emit('message', msgData);
						}
					}
				)
			});
			
			socket.on('disconnect', function() {
				var socketId = socket.id;
				// get userId
				db.query(
					"SELECT user_id FROM user WHERE socket_id = '" + socketId + "'",
					function(err, rows) {
						if (err) {
							throw err;
						} else {
							var disconnectUserId = rows[0].user_id;
							db.query(
								"UPDATE user SET socket_id = '0' WHERE socket_id = '" + socketId + "'",
								function(err) {
									if (err) {
										throw err;
									} else {
										io.sockets.emit('user_disconnect', {userId: disconnectUserId});
									}
								}
							)
						}
					}
				)
			});
		});
		
		db.query(
			"SELECT * FROM user WHERE username <> '" + username + "'",
			function (err, rows) {
				if (err) {
					throw err;
				}
				
				var context = {
					page: 'chat',
					users: rows,
					userId: userId,
					username: username
				};
				
				console.log(rows);
				res.render('chat', context);
			}
		)
		
	};
};