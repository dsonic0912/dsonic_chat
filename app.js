
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mysql = require('mysql');

var db = mysql.createConnection({
	host: 'localhost',
	user: 'uicodes',
	password: 'dL091218#',
	database: 'uicodes'
});

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(15277);

io.set('log level', 0);
io.set('close timeout', 15);
io.set('heartbeat timeout', 3);
io.set('heartbeat interval', 1);

// all environments
//app.set('port', process.env.PORT || 15277);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/chat', routes.chat(server, db));
app.post('/api/users', routes.populateUsers(db));
//app.get('/chat_win', routes.chat_win);
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
