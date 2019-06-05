const electron = require('electron');
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain
} = electron;
const path = require('path');
const url = require('url');
const request = require('request');
const colors = require('colors');
const Store = require('electron-store');
const store = new Store();
var logs = true
var aliveMessageInterval = null


app.on('ready', function(){
    ipcMain.on('switch:alive', function(e, data) {
        console.log('robotstreamer.alive',data)
        store.set('config.rs.cameraAlive', data)
    });
    store.onDidChange('config.rs.cameraAlive', function(to, from){
        console.log('config.rs.cameraAlive: ', to)
        app.win.webContents.send('config.rs.cameraAlive', to)
        check()
    })
    check()
})

function check(){
    if (store.get('config.rs.cameraAlive') === true) {
        startCameraAliveMessage()
    } else {
        stopCameraAliveMessage()
    }
}

function startCameraAliveMessage(){
    store.set('config.rs.cameraAlive', true)
    // robotstreamer robot is alive messages
    sendCameraAliveMessage(store.get('config.rs.api_protocol'), store.get('config.rs.api_host'), store.get('config.rs.api_port'), store.get('config.rs.cameraID'))

    aliveMessageInterval = setInterval(function() {
    	sendCameraAliveMessage(store.get('config.rs.api_protocol'), store.get('config.rs.api_host'), store.get('config.rs.api_port'), store.get('config.rs.cameraID'))
    }, 1000 * 60)
    console.log('camera alive message activated'.green)
}
function stopCameraAliveMessage(){
    clearInterval(aliveMessageInterval)
    store.set('config.rs.cameraAlive', false)
    console.log('camera alive message stopped'.green)
}

function sendCameraAliveMessage(api_protocol, api_host, api_port, cameraID, logs) {
	if (logs) console.log("sending camera alive message")
	var url = api_protocol + '://' + api_host + ':' + api_port + '/v1/set_camera_status'
	if (logs) console.log("url", url)
	var options = {
		url: url,
		method: 'POST',
		headers: {
			"content-type": "application/json",
		},
		json: {
			'camera_id': cameraID,
			'camera_status': 'online'
		}
	}
	if (logs) console.log(options)
	request(options, function(error, response, body) {
		if (logs) console.log('sendCameraAliveMessage error:', error);
		if (logs) console.log('sendCameraAliveMessage statusCode:', response && response.statusCode);
		if (logs) console.log('sendCameraAliveMessage body:', body);
	})
}

module.exports = {
    startCameraAliveMessage: startCameraAliveMessage,
    stopCameraAliveMessage: stopCameraAliveMessage,
    sendCameraAliveMessage: sendCameraAliveMessage
}
