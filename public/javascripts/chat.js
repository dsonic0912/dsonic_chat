$(document).ready(function() {
	var socket = io.connect('',
		{
			'sync disconnect on unload': true,
			'force new connection': true,
			'connect timeout': 500
		}
	);
	
	socket.on('connect', function() {
		var params = {
			userId: $("#userId").val(),
			username: $("#username").val()
		};
		socket.emit('online', params);
	});
	
	socket.on('connected', function(data) {
		console.log(data);
		socket.emit('repopulate_users', {});
	});
	
	socket.on('repopulate_users', function() {
		console.log('repopulate users');
		var userId = $("#userId").val();
		
		$.post('/api/users', {userId: userId}, function(data) {
			$(".list-group-users").html('');
		
			var html = '',
				status = '',
				active = '';
			
			data.forEach(function(user) {
				if (user.socket_id == '0') {
					status = '<p style="color:red;font-weight:bold;">Offline</p>';
				} else {
					status = '<p style="color:green;font-weight:bold;">Online</p>';
				}
				
				html += '<a href="#" userId="' + user.user_id + '" active="false" class="list-group-item list-users">';
				html += '<h4>' + user.username + '</h4>';
				html += '<span class="onlineStatus">';
				html += status;
				html += '</span>';
				html += '</a>';
			});
			
			$(".list-group-users").html(html);
		}, 'json');
	});
	
	socket.on('user_joined', function(data) {
		console.log('joined: ', data);
		var joinedId = data.userId;
		
		$(".list-users[userId=" + joinedId + "]").children('span').children('p').html('Online').css('color', 'green');
	});
	
	socket.on('message', function(data) {
		var fromUserId = data.fromUserId,
			fromUsername = data.fromUsername,
			message = data.message,
			isActive = 'false';
			
			$(".chat-body").each(function(i, obj) {
				if ($(this).attr('toUserId') == fromUserId) {
					isActive = 'true';
				}
			});
			
		var fullMessage = fromUsername + ': ' + message + '<br>';
			
		if (isActive === 'true') {
			var chatBody = $(".chat-body[toUserId=" + fromUserId + "]");
			
			fullMessage = fromUsername + ': ' + message + '<br>';
			chatBody.append(fullMessage);
		} else {
			var chatWindows = '<div class="col-6 col-sm-6 col-lg-4">';
				chatWindows += '<div class="panel panel-primary">';
				chatWindows += '<div class="panel-heading">';
				chatWindows += '<h3 class="panel-title">' + fromUsername + '</h3>';
				chatWindows += '</div>';
				chatWindows += '<div class="panel-body">';
				chatWindows += '<div class="chat-body" toUserId="' + fromUserId + '">';
				chatWindows += fullMessage;
				chatWindows += '</div>';
				chatWindows += '<div class="chat-msg">'
				chatWindows += '<textarea style="width:70%; height:50px; resize:none;" toUserId="' + fromUserId + '"></textarea>';
				chatWindows += '<button class="btn btn-primary btn-send-msg" toUserId="' + fromUserId + '">Send</button>';
				chatWindows += '</div>';
				chatWindows += '</div>';
				chatWindows += '</div>';
				chatWindows += '</div><!--/span-->';
			
			$(".row-chat").append(chatWindows);
			$(".list-users[userId=" + fromUserId + "]").attr('active', 'true');
		}
	});
	
	socket.on('user_disconnect', function(data) {
		var disconnectId = data.userId;
		
		$(".list-users[userId=" + disconnectId + "]").children('span').children('p').html('Offline').css('color', 'red');
	});
	
	$(document).on('click', '.list-users', function() {
		var toUserId = $(this).attr('userId'),
			toUserName = $(this).children('h4').html(),
			//isActive = $(this).attr('active');
			isActive = 'false';
			
			$(".chat-body").each(function(i, obj) {
				if ($(this).attr('toUserId') == toUserId) {
					isActive = 'true';
				}
			});
			
		
		if (isActive === 'false') {
			var chatWindows = '<div class="col-6 col-sm-6 col-lg-4">';
				chatWindows += '<div class="panel panel-primary">';
				chatWindows += '<div class="panel-heading">';
				chatWindows += '<h3 class="panel-title">' + toUserName + '</h3>';
				chatWindows += '</div>';
				chatWindows += '<div class="panel-body">';
				chatWindows += '<div class="chat-body" toUserId="' + toUserId + '">';
				chatWindows += '</div>';
				chatWindows += '<div class="chat-msg">'
				chatWindows += '<textarea style="width:70%; height:50px; resize:none;" toUserId="' + toUserId + '"></textarea>';
				chatWindows += '<button class="btn btn-primary btn-send-msg" toUserId="' + toUserId + '">Send</button>';
				chatWindows += '</div>';
				chatWindows += '</div>';
				chatWindows += '</div>';
				chatWindows += '</div><!--/span-->';
			
			$(".row-chat").append(chatWindows);
			
			$(this).attr('active', 'true');
		}
	});
	
	$(document).on('click', '.btn-send-msg', function() {
		var toUserId = $(this).attr('toUserId'),
			message = $(this).parent().children('textarea').val(),
			fromUserId = $("#userId").val();
			fromUsername = $("#username").val();
			
		//console.log('toUser: ' + toUserId + ', message: ' + message + ', fromUserId: ' + fromUserId);
		var msgData = {
			toUserId: toUserId,
			message: message,
			fromUserId: fromUserId,
			fromUsername: fromUsername
		};
		
		var fullMessage = fromUsername + ': ' + message + '<br>';
		$(this).parent().prev().append(fullMessage);
		
		//console.log(msgData);
		socket.emit('message', msgData);
		
		$(this).parent().children('textarea').val('');
	});
	
});