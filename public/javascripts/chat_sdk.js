(function(window, undefined) {
	var Chat = {};
	var g_sdkUrl = 'http://uicodes.dsonic.webfactional.com/socket.io/socket.io.js';
	var socket = {};
	
	if (window.Chat) {
		return;
	}
	
	function loadScript(url, callback) {
		var script = document.createElement('script');
		script.async = true;
		script.src = url;
		
		var entry = document.getElementsByTagName('script')[0];
		entry.parentNode.insertBefore(script, entry);
		
		script.onload = script.onreadystatechange = function() {
			var rdyState = script.readyState;
			
			if (!rdyState || /complete|loaded/.test(script.readyState)) {
				callback();
				
				script.onload = null;
				script.onreadystatechange = null;
			}
		};
	}
	
	Chat.init = function(callback) {
		loadScript(g_sdkUrl, function() {
			socket = io.connect('uicodes.dsonic.webfactional.com',
				{
					'reconnection delay': 50,
					'connect timeout': 5000,
					'sync disconnect on unload': true
				}
			);
			
			socket.on('init', function(data) {
				callback(data);
			});
		});
	};
	
	window.Chat = Chat;
}) (this);

if (typeof window.Chat_ready === 'function') {
	window.Chat_ready();
}