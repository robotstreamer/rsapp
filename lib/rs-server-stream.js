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

const {	spawn } = require('child_process');
var killProcess = require('tree-kill');

var ffmpeg = require('ffmpeg-static');
var ffmpegPath = ffmpeg.path.replace('app.asar', 'app.asar.unpacked')
console.log('ffmpegPath: ',ffmpegPath)

console.log('+++++++++++++++++++++++++'.red + ' stremaing')

var encoder_video = null
var encoder_audio = null

var logs = true

function getVideoEndpoint(api_protocol, api_host, api_port, cameraID, logs){
    // http://robotstreamer.com:6001/v1/get_endpoint/jsmpeg_video_capture/211
    var url = api_protocol + '://' + api_host + ':' + api_port + '/v1/get_endpoint/jsmpeg_video_capture/' + cameraID
	if (logs) console.log("url", url)
	var options = {
		url: url,
		method: 'GET',
		headers: {
			"content-type": "application/json",
		}
	}
	if (logs) console.log(options)
	request(options, function(error, response, body) {
		if (logs) console.log('getVideoEndpoint error:', error);
		if (logs) console.log('getVideoEndpoint statusCode:', response && response.statusCode);
		if (logs) console.log('getVideoEndpoint body:', body);
        if (!error && body){
            body = JSON.parse(body)
            store.set('config.rs.video_host',body.host)
            store.set('config.rs.video_port',body.port)
            startVideoFFMPEG()
        }
	})
}

function getAudioEndpoint(api_protocol, api_host, api_port, cameraID, logs){
    // http://robotstreamer.com:6001/v1/get_endpoint/jsmpeg_video_capture/211
    var url = api_protocol + '://' + api_host + ':' + api_port + '/v1/get_endpoint/jsmpeg_audio_capture/' + cameraID
	if (logs) console.log("url", url)
	var options = {
		url: url,
		method: 'GET',
		headers: {
			"content-type": "application/json",
		}
	}
	if (logs) console.log(options)
	request(options, function(error, response, body) {
		if (logs) console.log('getAudioEndpoint error:', error);
		if (logs) console.log('getAudioEndpoint statusCode:', response && response.statusCode);
		if (logs) console.log('getAudioEndpoint body:', body);
        if (!error && body){
            body = JSON.parse(body)
            store.set('config.rs.audio_host',body.host)
            store.set('config.rs.audio_port',body.port)
            startAudioFFMPEG()
        }
	})
}




function killEncoderVideo(){
        console.log('killing video')
        encoder_video.stdin.pause()
        encoder_video.kill()
}
function killEncoderAudio(){
        console.log('killing audio')
        encoder_audio.stdin.pause()
        encoder_audio.kill()
}


function startVideoStream(){
    getVideoEndpoint(store.get('config.rs.api_protocol'), store.get('config.rs.api_host'), store.get('config.rs.api_port'), store.get('config.rs.cameraID'), true)
}

function startVideoFFMPEG(){
  // ffmpeg video server
  var args = '-re -i rtmp://localhost/live/cam -an -f mpegts -r 30 -codec:v mpeg1video -b:v '+store.get('config.rs.videoBitrate')+' -bf 0 -muxdelay 0.001 http://'+store.get('config.rs.video_host')+':'+store.get('config.rs.video_port')+'/'+store.get('config.rs.streamKey')+'/'+store.get('config.rs.screenWidth')+'/'+store.get('config.rs.screenHeight')+'/'
  console.log(args.yellow)
  args = args.split(' ')
  if (encoder_video) killEncoderVideo()
  encoder_video = spawn(ffmpegPath, args);
  encoder_video.stderr.pipe(process.stdout);
}

function endVideoStream(){
    killProcess(encoder_video.pid)
}

function startAudioStream(){
    getAudioEndpoint(store.get('config.rs.api_protocol'), store.get('config.rs.api_host'), store.get('config.rs.api_port'), store.get('config.rs.cameraID'), true)
}

function startAudioFFMPEG(){
  // ffmpeg audio server
  var args = '-re -i rtmp://localhost/live/cam -vn -r 30 -ac 2 -ar 44100 -f mpegts -codec:a mp2 -b:a '+store.get('config.rs.audioBitrate')+' -muxdelay 0.001 http://'+store.get('config.rs.audio_host')+':'+store.get('config.rs.audio_port')+'/'+store.get('config.rs.streamKey')+'/'+store.get('config.rs.screenWidth')+'/'+store.get('config.rs.screenHeight')+'/'
  console.log(args.yellow)
  args = args.split(' ')
  if (encoder_audio) killEncoderAudio()
  encoder_audio = spawn(ffmpegPath, args);
  encoder_audio.stderr.pipe(process.stdout)
}
function endAudioStream(){
    killProcess(encoder_audio.pid)
}


nms = {
    on:function(){}
}


function setNMS(f){
    nms = f

    nms.on('postPublish', (id, StreamPath, args) => {
        console.log('++++++ rs-server-stream: '.red + '__postPublish'.green)
        startVideoStream()
        startAudioStream()
    });

    nms.on('donePublish', (id, StreamPath, args) => {
        console.log('+++++++ rs-server-stream: '.red + '__donePublish'.green)
        endVideoStream()
        endAudioStream()
    });
}

module.exports = {
    getVideoEndpoint: getVideoEndpoint,
    getAudioEndpoint: getAudioEndpoint,
    startVideoStream: startVideoStream,
    startAudioStream: startAudioStream,
    endVideoStream: endVideoStream,
    endAudioStream: endAudioStream,
    setNMS: setNMS
}
