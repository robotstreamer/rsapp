$(document).ready(function(){
    $('input[name=switch-alive]')[0].checked = store.get('config.rs.cameraAlive')
    $('input[name=switch-alive]').change(function(e) {
        console.log('(input[name=switch-alive]).change', e.currentTarget)
        if (e.currentTarget.checked) {
            ipcRenderer.send('switch:alive', true)
        } else {
            ipcRenderer.send('switch:alive', false)
        }
    })
    ipcRenderer.on('switch:alive', function(event, message) {
        store.set('config.rs.cameraAlive', message)
    });
    store.onDidChange('config.rs.cameraAlive', function(to, from) {
        $('input[name=switch-alive]').checked = to
    })
})
