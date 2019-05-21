const electron = require('electron');
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain
} = electron;
const path = require('path');
const url = require('url');

const say = require('say');
const colors = require('colors');

const Store = require('electron-store');
const store = new Store();

var tts = {}
tts.speaking  = false
tts.queue     = []
tts.voice     = store.get('config.rs.tts_voice') || 'Alex'
tts.speed     = store.get('config.rs.tts_speed') || 1
tts.enabled   = store.get('config.rs.tts_enabled') || false
tts.pausetime = store.get('config.rs.tts_pausetime') || 1
tts.queuemax  = store.get('config.rs.tts_queuemax') || 20

tts.speak = function(phrase) {
    if (tts.queue.length <= tts.queuemax) {
        tts.queue.push(phrase);
        store.set('status.tts.messages', tts.queue.length)
        console.log('queue,speaking:'.red, tts.queue, tts.speaking)
        trySpeech(phrase);
    }
}
tts.now = function(phrase) {
    say.speak(phrase, store.get('config.rs.tts_voice'), store.get('config.rs.tts_speed'));

}
tts.stop = function(callback) {
    say.stop(() => {
        if (callback) callback();
    });
}

app.on('ready', function(){
    // switch tts
    ipcMain.on('switch:tts', function(e, data) {
        console.log('rs.tts_enabled',data)
        store.set('config.rs.tts_enabled', data)
    });
    store.onDidChange('config.rs.tts_enabled', function(to, from){
        console.log('config.rs.tts_enabled: ', to)
        app.win.webContents.send('config.rs.tts_enabled', to)
        tts.enabled = store.get('config.rs.tts_enabled')
        checkEnabled()
    })

    // select Voice
    ipcMain.on('select:tts:voice', function(e, data) {
        console.log('rs.tts_voice',data)
        store.set('config.rs.tts_voice', data)
    });
    store.onDidChange('config.rs.tts_voice', function(to, from){
        console.log('config.rs.tts_voice: ', to)
        app.win.webContents.send('config.rs.tts_voice', to)
        tts.voice = store.get('config.rs.tts_voice')
        tts.now('voice changed')
    })

    // select Speed
    ipcMain.on('select:tts:speed', function(e, data) {
        console.log('rs.tts_speed',data)
        store.set('config.rs.tts_speed', data)
    });
    store.onDidChange('config.rs.tts_speed', function(to, from){
        console.log('config.rs.tts_speed: ', to)
        app.win.webContents.send('config.rs.tts_speed', to)
        tts.speed = store.get('config.rs.tts_speed')
        tts.now('speed changed')
    })

    // change pausetime
    ipcMain.on('input:tts:pausetime', function(e, data) {
        console.log('rs.tts_pausetime',data)
        store.set('config.rs.tts_pausetime', data)
    });
    store.onDidChange('config.rs.tts_pausetime', function(to, from){
        console.log('config.rs.tts_pausetime: ', to)
        app.win.webContents.send('config.rs.tts_pausetime', to)
        tts.pausetime = store.get('config.rs.tts_pausetime')
        tts.now('pause time changed')
    })

    // change queue max
    ipcMain.on('input:tts:queuemax', function(e, data) {
        console.log('rs.tts_queuemax',data)
        store.set('config.rs.tts_queuemax', data)
    });
    store.onDidChange('config.rs.tts_queuemax', function(to, from){
        console.log('config.rs.tts_queuemax: ', to)
        app.win.webContents.send('config.rs.tts_queuemax', to)
        tts.queuemax = store.get('config.rs.tts_queuemax')
        tts.now('max changed')
    })

    // trigger tts clear
    ipcMain.on('button:tts:queueclear', function(e, data) {
        console.log('rs.tts_queueclear')
        tts.queue = []
        store.set('status.tts.messages', tts.queue.length)
        tts.now('queue cleared')
    });
    
    // status queued messages
    store.onDidChange('status.tts.messages', function(to, from){
        app.win.webContents.send('status:tts:messages', to)
    })

})

function checkEnabled(){
    if (tts.enabled) {
        tts.speak('tts enabled')
    } else {
        tts.now('tts disabled')
    }
}
checkEnabled()



function trySpeech() {
    if (tts.speaking === false && tts.queue.length >= 1 && tts.enabled) {
        tts.speaking = true;
        var p = tts.queue[0]
        console.log('Speaking: '.magenta, p)
        say.speak(p, store.get('config.rs.tts_voice'), store.get('config.rs.tts_speed'), function(err){
            setTimeout(function(){
                tts.queue.shift()
                store.set('status.tts.messages', tts.queue.length)
                tts.speaking = false;
            },10 + tts.pausetime * 1000)
        });
    }
}
setInterval(function() {
    trySpeech();
}, 60);


module.exports = {
    tts:tts
}
