const electron = require('electron');
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    globalShortcut
} = electron;
const path = require('path');
const url = require('url');
const WebSocket = require('ws')
const request = require('request');

const colors = require('colors');

const process = require('process')
const exec = require('executive');
let isWin = process.platform === "win32";

const Store = require('electron-store');
const store = new Store();

var lush = {}
lush.active   = false
lush.enabled  = store.get('config.rs.lush_enabled') || false
lush.volume   = store.get('config.rs.lush_volume') || 1.0

app.on('ready', function(){
    // switch tts
    ipcMain.on('switch:lush', function(e, data) {
        console.log('rs.lush_enabled',data)
        store.set('config.rs.lush_enabled', data)
    });
    store.onDidChange('config.rs.lush_enabled', function(to, from){
        console.log('config.rs.lush_enabled: ', to)
        app.win.webContents.send('config.rs.lush_enabled', to)
        lush.enabled = store.get('config.rs.lush_enabled')
        checkEnabled()
    })

    // trigger lush test
    ipcMain.on('button:lush:test', function(e, data) {
        console.log('rs.lush_test')
        lushCommand(10)
    });

    // select Speed
    ipcMain.on('select:lush:volume', function(e, data) {
        console.log('rs.lush_volume',data)
        store.set('config.rs.lush_volume', data)
    });
    store.onDidChange('config.rs.lush_volume', function(to, from){
        console.log('config.rs.lush_volume: ', to)
        app.win.webContents.send('config.rs.lush_volume', to)
        lush.volume = store.get('config.rs.lush_volume')
    })

})






let ws = null

// get control host get_control_host_port
function initControlHost() {
  var host      = store.get('config.rs.api_host')
  var port      = store.get('config.rs.api_port')
  var protocol  = store.get('config.rs.api_protocol')
  var robot_id  = store.get('config.rs.robotID')
  request(protocol + '://' + host + ':' + port + '/get_control_host_port/' + robot_id, function(error, response, body) { // 100 should be ro$
      console.log('error:', error);
      console.log('statusCode:', response && response.statusCode);
      console.log('body:', body);
      if (!error && response && response.statusCode == 200 && body) {
          var data = JSON.parse(body)
          console.log(data)
          if (data && data.host && data.port) {
              store.set('config.rs.control_host',data.host)
              store.set('config.rs.control_port',data.port)
              openControlHostWebsocket()
          }
      }
  });
}

function openControlHostWebsocket() {
	var host      = store.get('config.rs.control_host')
  var port      = store.get('config.rs.control_port')
  var protocol  = store.get('config.rs.control_protocol')
	console.log('<== ctrl ws opening.. '.green, protocol, host, port);
  if (!ws) {
    ws = new WebSocket(protocol + '://' + host + ':' + port + '/echo', {
  		headers: {
  			'http_user_agent': 'rsapp-lush'
  		}
  	});
  }

	ws.on('open', function open() {
		console.log('<=> ctrl ws open '.green, host, port)
		var command = '{"command": "' + store.get('config.rs.streamKey') + '"}'
		console.log('sending command: ', command)
		ws.send(command)
	});

	ws.on('close', function(error) {
		console.log('control host connection closed', error)
    if (store.get('config.rs.lush_enabled')) {
      console.log('control restarting in 5 sec')
      setTimeout(function() {
  			initControlHost()
  		}, 5000)
    } else {
      ws = null
    }
	})

	ws.on('error', function(error) {
		console.log('control host error'.red, error)
	})

	ws.on('message', function incoming(data) {
		data = data.replace('\n', '')
		var msg = JSON.parse(data)
    console.log('==> ctrl ws rx: '.green,msg)

		if (msg && msg.command && msg.command.length && msg.key_position === 'up') {
			console.log(msg)
      if (msg.command === 'LUSH5') {
        lushCommand(5)
      }
      if (msg.command === 'LUSH10') {
        lushCommand(10)
      }
      if (msg.command === 'LUSH20') {
        lushCommand(20)
      }
		}
	});
}


if (store.get('config.rs.lush_enabled')) {
  initControlHost()
}
function checkEnabled(){
    if (lush.enabled) {
      console.log('lush enabled')
      initControlHost()
    } else {
      console.log('lush disabled')
      if (ws) {
        console.log('lush control stopped')
        ws.close()
      }
    }
}
// checkEnabled()


lush.timeout = null

function playSound(speed) {
  // play sound
  exec.quiet('mplayer -speed ' + speed + ' -volume ' + lush.volume*100 + ' ./assets/sounds/loselife.mp3 ')
}

function lushCommand(num){
  console.log('lushCommand: '.red, num)
  // stop:    https://localhost.lovense.com:30010/Vibrate?v=0
  // speed 5: https://localhost.lovense.com:30010/Vibrate?v=5
  // speed10: https://localhost.lovense.com:30010/Vibrate?v=10
  // speed20: https://localhost.lovense.com:30010/Vibrate?v=20
  // should run for 5 sec and then stop

  let url = 'https://localhost.lovense.com:30010'
  let cmd = '/Vibrate?v=' + num

  if (num === 5)  playSound(0.4)
  if (num === 10) playSound(0.5)
  if (num === 20) playSound(0.6)


  request(url + cmd, function(error, response, body) { // 100 should be ro$
      console.log('error:', error);
      console.log('statusCode:', response && response.statusCode);
      console.log('body:', body);
      if (!error && response && response.statusCode == 200 && body) {
          console.log('lush response', body)
      }
  });



  if (num) {
    if (lush.timeout) {
      clearTimeout(lush.timeout)
    }
    lush.timeout = setTimeout(function(){
      lushCommand(0)
    },5000)
  }

}
