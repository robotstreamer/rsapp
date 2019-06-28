const electron = require('electron');
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain
} = electron;
const path = require('path');
const url = require('url');
const WebSocket = require('ws')
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
var encoder_videoRTC = null

var videoTranport = null
var audioTranport = null
var videoSSRC = null
var audioSSRC = null

var logs = true


function makeRandomId(){

  return Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000;
}


function initWebRTC(){
  console.log('initWebRTC')
  getSFUEndpoint(store.get('config.rs.api_protocol'), store.get('config.rs.api_host'), store.get('config.rs.api_port'), true)
  openSFUWebsocket(store.get('config.rs.robotID'));
}


function getSFUEndpoint(api_protocol, api_host, api_port, logs){

  var url = api_protocol + '://' + api_host + ':' + api_port + '/v1/get_endpoint/webrtc_sfu/100'

  if (logs) console.log("getSFUEndpoint url", url)
  var options = {
    url: url,
    method: 'GET',
    headers: {
      "content-type": "application/json",
    }
  }
  if (logs) console.log(options)
  request(options, function(error, response, body) {
    if (logs) console.log('getSFUEndpoint error:', error);
    if (logs) console.log('getSFUEndpoint statusCode:', response && response.statusCode);
    if (logs) console.log('getSFUEndpoint body:', body);
        if (!error && body){
            body = JSON.parse(body)
            store.set('config.rs.SFU_host',body.host)
            store.set('config.rs.SFU_port',body.port)
        }
  })
}


//yes... don't do this - this is just a test. need to look at prooto-client
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

function openSFUWebsocket(roomId) {
    var host = store.get('config.rs.SFU_host')
    var port = store.get('config.rs.SFU_port')

  console.log('<== openSFUWebsocket opening.. '.yellow, host, port);

  wssSFU = new WebSocket('wss://' + host + ':' + port + '/?roomId='+roomId+'&peerId=p:rsapp_'+makeRandomId(), 
                          protocols=['protoo']);

  //on open send join message
  wssSFU.on('open', function open() {
    console.log('<=> SFU open '.yellow, host, port);
    SFUSendJoin()
  });
  wssSFU.on('error', function(error){
      console.log('wssSFU error: ', error)
  })

  wssSFU.on('close', function(error){
      console.log('wssSFU close: ', error)
  })


  //handle the ws responses by id
  wssSFU.on('message', function incoming(data) {
    var msg = JSON.parse(data);

    //on join response
    if (msg.id == 0 && msg.ok == true){
      console.log("SFU join ok");
      SFURequestPlainTransportVideo();
      SFURequestPlainTransportAudio();
    }

    //RequestPlainTransport
    if (msg.id == 20 && msg.ok == true){
      console.log("SFURequestPlainTransportVideo response ok");
      videoTranport = msg.data.tuple;;
      //transport created - create video with the transport id
      SFUrequestCreateProducerVideo(msg.data.id);
    }
    //RequestPlainTransport
    if (msg.id == 21 && msg.ok == true){
      console.log("SFURequestPlainTransportAudio response ok");
      audioTranport = msg.data.tuple;;
      //transport created - create audio with the transport id
      SFUrequestCreateProducerAudio(msg.data.id);
    }

    //CreateProducer
    if (msg.id == 3 && msg.ok == true){
      console.log("SFUrequestCreateProducerVideo response ok");
      //temp 
      startFFMPEGwebRTC();
    }
    //CreateProducer
    if (msg.id == 4 && msg.ok == true){
      console.log("SFUrequestCreateProducerAudio response ok");
    }

  });



  function SFUSendJoin(){
    var command = {request: true,
                   id: 0,
                   method  : 'join',   
                   data    : {rtpCapabilities : {dummy: 'dummy'} }  //required var for room                      
                  }

    wssSFU.send(JSON.stringify(command))
  }


  function SFURequestPlainTransportVideo(){
    var command = {request: true,
                   id: 20,
                   method  : 'createPlainRtcTransport',   
                   data    :  { producing : true,
                                consuming : false,
                                streamkey : store.get('config.rs.streamKey')
                              }                       
                  }

    wssSFU.send(JSON.stringify(command))
  }


  function SFURequestPlainTransportAudio(){
    var command = {request: true,
                   id: 21,
                   method  : 'createPlainRtcTransport',   
                   data    :  { producing : true,
                                consuming : false,
                                streamkey : store.get('config.rs.streamKey')
                              }                       
                  }

    wssSFU.send(JSON.stringify(command))
  }



  function SFUrequestCreateProducerVideo(transportId){

    videoSSRC = makeRandomId()
    var command = {request: true,
                   id: 3,
                   method  : 'produce',   
                   data    : {transportId : transportId,
                              kind        : 'video',
                              rtpParameters : { codecs : [{mimeType :"video/H264", 
                                                           payloadType : 101, 
                                                           parameters: {'packetization-mode': 1,
                                                                        'profile-level-id'  : '42e01f',
                                                                        'level-asymmetry-allowed': 1
                                                                       },
                                                           clockRate:90000 }],
                                                           encodings: [{ 'ssrc': videoSSRC }] 
                                              }           
                            }   
                  }

    wssSFU.send(JSON.stringify(command))
  }


  function SFUrequestCreateProducerAudio(transportId){

    audioSSRC = makeRandomId()
    var command = {request: true,
                   id: 4,
                   method  : 'produce',   
                   data    : {transportId : transportId,
                              kind        : 'audio',
                              rtpParameters : { codecs :[{mimeType :"audio/opus", 
                                                          payloadType: 100, 
                                                          channels: 2, 
                                                          clockRate: 48000,
                                                          parameters:{ 'sprop-stereo':1 } }],
                                                          encodings: [{ 'ssrc': audioSSRC }]    
                                              }           
                            }   
                  }

    wssSFU.send(JSON.stringify(command))
  }

}//end openSFUWebsocket


//jsmpeg
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


//jsmpeg
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




//jsmpeg
function startVideoStream(){
    getVideoEndpoint(store.get('config.rs.api_protocol'), store.get('config.rs.api_host'), store.get('config.rs.api_port'), store.get('config.rs.cameraID'), true)
}

//jsmpeg
function startAudioStream(){
    getAudioEndpoint(store.get('config.rs.api_protocol'), store.get('config.rs.api_host'), store.get('config.rs.api_port'), store.get('config.rs.cameraID'), true)
}


//jsmpeg
function startVideoFFMPEG(){
  // ffmpeg video server
  var args = '-re -i rtmp://localhost/live/cam -an -f mpegts -r 30 -codec:v mpeg1video -b:v '+store.get('config.rs.videoBitrate')+' -bf 0 -muxdelay 0.001 http://'+store.get('config.rs.video_host')+':'+store.get('config.rs.video_port')+'/'+store.get('config.rs.streamKey')+'/'+store.get('config.rs.screenWidth')+'/'+store.get('config.rs.screenHeight')+'/'
  console.log(args.yellow)
  args = args.split(' ')
  if (encoder_video) killEncoderVideo()
  encoder_video = spawn(ffmpegPath, args);
  encoder_video.stderr.pipe(process.stdout);
}

//jsmpeg
function startAudioFFMPEG(){
  // ffmpeg audio server
  var args = '-re -i rtmp://localhost/live/cam -vn -r 30 -ac 2 -ar 44100 -f mpegts -codec:a mp2 -b:a '+store.get('config.rs.audioBitrate')+' -muxdelay 0.001 http://'+store.get('config.rs.audio_host')+':'+store.get('config.rs.audio_port')+'/'+store.get('config.rs.streamKey')+'/'+store.get('config.rs.screenWidth')+'/'+store.get('config.rs.screenHeight')+'/'
  console.log(args.yellow)
  args = args.split(' ')
  if (encoder_audio) killEncoderAudio()
  encoder_audio = spawn(ffmpegPath, args);
  encoder_audio.stderr.pipe(process.stdout)
}


//webrtc
function startFFMPEGwebRTC(){
  // ffmpeg video server
  var args = '\
-re -i rtmp://localhost/live/cam \
-map 0:v:0 -pix_fmt yuv420p -c:v libx264 -b:v '+store.get('config.rs.videoBitrate')+' -g 50 -preset ultrafast \
-c:a libopus -b:a '+store.get('config.rs.audioBitrate')+' -ac 2 -ar 48000 -map 0:a:0 \
-f tee \
[select=a:f=rtp:ssrc='+audioSSRC+':payload_type=100]rtp://'+audioTranport.localIp+':'+audioTranport.localPort+'|\
[select=v:f=rtp:ssrc='+videoSSRC+':payload_type=101]rtp://'+videoTranport.localIp+':'+videoTranport.localPort+''
  console.log(args.yellow)


  args = args.split(' ')
  console.log(args)


  if (encoder_videoRTC) killEncoderVideo()
  encoder_videoRTC = spawn(ffmpegPath, args);
  encoder_videoRTC.stderr.pipe(process.stdout);
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

function killEncoderRTC(){
        console.log('killing killEncoderRTC')
        encoder_videoRTC.stdin.pause()
        encoder_videoRTC.kill()
}


function endVideoStream(){
    killProcess(encoder_video.pid)
}

function endAudioStream(){
    killProcess(encoder_audio.pid)
}

function endRTCStream(){
    killEncoderRTC(encoder_videoRTC.pid)
}



nms = {
    on:function(){}
}


function setNMS(f){
    nms = f

    nms.on('postPublish', (id, StreamPath, args) => {
        console.log('++++++ rs-server-stream: '.red + '__postPublish'.green)
        
        if (store.get('config.rs.videotype') == 'webrtc'){
          console.log('videotype webrtc'.red + '__postPublish'.green)
          initWebRTC();
        }
        else{
          startVideoStream()
          startAudioStream()
        }

    });

    nms.on('donePublish', (id, StreamPath, args) => {
        console.log('+++++++ rs-server-stream: '.red + '__donePublish'.green)

        if (store.get('config.rs.videotype') == 'webrtc'){
          console.log('videotype webrtc'.red + '__donePublish'.green)
          //initWebRTC();
        }
        else{
          endVideoStream()
          endAudioStream()
        }


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
