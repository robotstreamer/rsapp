const electron = require('electron');
const {
    app,
    ipcMain
} = electron;
const colors = require('colors');
const WebSocket = require('ws')
const path = require('path');
const url = require('url');
const request = require('request');
const Store = require('electron-store');
const store = new Store();

var wsChat;

var tts = {
    speak: function(){}
}



function initChat(){
  console.log('Init Chat..')
  getChatEndpoint(store.get('config.rs.api_protocol'), store.get('config.rs.api_host'), store.get('config.rs.api_port'), true)
}

if (store.get('config.rs.tts_enabled')) {
  initChat()
}

app.on('ready', function(){
    ipcMain.on('switch:tts', function(e, data) {
        if (data) {
          console.log('chat should start')
          initChat()
        } else {
          console.log('chat should stop')
          if(wsChat){
            wsChat.close()
            wsChat = null
          }
        }
    });
})



function getChatEndpoint(api_protocol, api_host, api_port, logs){
  // https://api.robotstreamer.com/v1/get_random_endpoint/rschatssl/100
  var url = api_protocol + '://' + api_host + ':' + api_port + '/v1/get_random_endpoint/rschatssl/100'
	if (logs) console.log("chat endpoint url: ", url)
	var options = {
		url: url,
		method: 'GET',
		headers: {
			"content-type": "application/json",
		}
	}
	if (logs) console.log(options)
	request(options, function(error, response, body) {
		if (logs) console.log('getChatEndpoint error:', error);
		if (logs) console.log('getChatEndpoint statusCode:', response && response.statusCode);
		if (logs) console.log('getChatEndpoint body:', body);
        if (!error && body){
            body = JSON.parse(body)
            store.set('config.rs.chat_host',body.host)
            store.set('config.rs.chat_port',body.port)
            openChatHostWebsocket()
        }
	})
}


function openChatHostWebsocket() {
    var host = store.get('config.rs.chat_host')
    var port = store.get('config.rs.chat_port')
    var protocol = store.get('config.rs.chat_protocol')
	console.log('<== ws-chat opening.. '.yellow, host, port);
    if(wsChat) {
        wsChat.close()
        wsChat = null
    }
	wsChat = new WebSocket(protocol + '://' + host + ':' + port + '/echo');

	wsChat.on('open', function open() {
		console.log('<=> ws-chat open '.yellow, host, port);
		var command = '{"message": "message"}'
		console.log('sending command: ', command)
		wsChat.send(command)
	});

	wsChat.on('message', function incoming(data) {
		// console.log('==> chat rx: '.yellow)
		// console.log(JSON.parse(data));
		var msg = JSON.parse(data)
        if (msg && msg.robot_id && msg.robot_id === store.get('config.rs.robotID') && msg.tts) {
            console.log('==> chat rx: '.yellow)
            console.log(JSON.parse(data));
            tts.speak(msg.message.substr(0,75))
        }
	});

    wsChat.on('error', function(error){
        console.log(error)
    })

    wsChat.on('close', function(error){
        if(store.get('config.rs.tts_enabled')) {
            console.log('chat closed, restarting in 1000');
            setTimeout(function(){
        		console.log('chat client closed connection'.red, error)
                if (store.get('config.rs.tts_enabled')){
                  initChat()
                }
        	},1000)
        } else {
            console.log('chat closed, not restarting');
        }
    })
}
function setTTS(f){
    tts = f
}
function onMessage(msg){
    return msg
}
function restart(){
    if (wsChat) {
      wsChat.close();
    } else {
      initChat()
    }
}


module.exports = {
    setTTS: setTTS,
    restart: restart
}
