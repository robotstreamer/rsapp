const NodeMediaServer = require('node-media-server');
const colors = require('colors');
const electron = require('electron');
const {
    app,
    ipcMain
} = electron;

const Store = require('electron-store');
const store = new Store();

const rsStream = require('./rs-server-stream')

var nms = new NodeMediaServer(store.get('config.nms'))

rsStream.setNMS(nms)

app.on('ready', function(){
    ipcMain.on('switch:nms', function(e, data) {
        console.log('nms.enabled',data)
        store.set('config.nms.enabled', data)
    });
    store.onDidChange('config.nms.enabled', function(to, from){
        console.log('config.nms.enabled: ', to)
        app.win.webContents.send('config.nms.enabled', to)
        store.set('config.nms.enabled', to)
        restart()
    })
})

function checkEnabled(){
    console.log('nms:checking enabled', store.get('config.nms.enbled'))
    if (store.get('config.nms') && store.get('config.nms.enabled')){
        nms.run();
    } else {
        nms.stop()
    }
}
checkEnabled()

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('_______[post-Publish]'.red, `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('________[done-Publish]'.red, `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

function restart(){
    checkEnabled()
}

module.exports = {
    nms: nms,
    restart: restart
}
