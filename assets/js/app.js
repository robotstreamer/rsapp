console.log('main.js')
console.log('starting...')
const electron = require('electron');
const Store = require('electron-store');
const store = new Store();

const {
    ipcRenderer
} = electron;
var config = {}
ipcRenderer.on('config:load', function(event, message) {
    console.log('config:load', message)
    config = message
});

$(document).ready(function(){
  $('.collapsible').collapsible();  
});

function removeItem(e) {
    event.target.remove();
    if (ul.children.length == 0) {
        ul.className = '';
    }
}

function saveConfig() {
    console.log('Saving config...', config)
    var inputs = document.querySelectorAll('input')
    inputs.forEach(function(input) {
        config.rs[input.name] = input.value
    })
    ipcRenderer.send('config:save', config)
    alert('Config saved.')
}
