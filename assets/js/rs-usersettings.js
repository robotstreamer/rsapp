$(document).ready(function() {

    store.get('toggle.user') ? $('.settings-user').show() : $('.settings-user').hide()
    $('.toggle-settings-user').click(function() {
        let toggle = store.get('toggle.user')
        if (toggle) {
            $('.settings-user').hide()
        } else {
            $('.settings-user').show()
        }
        store.set('toggle.user', !toggle)
    })

    $('input[name=input-robot-id]')[0].value = store.get('config.rs.robotID')
    $('input[name=input-robot-id]').change(function(e) {
        let value = e.currentTarget.value
        store.set('config.rs.robotID', value)
        ipcRenderer.send('stream:restart', true)
        ipcRenderer.send('chat:restart', true)
    })

    $('input[name=input-camera-id]')[0].value = store.get('config.rs.cameraID')
    $('input[name=input-camera-id]').change(function(e) {
        let value = e.currentTarget.value
        store.set('config.rs.cameraID', value)
        ipcRenderer.send('stream:restart', true)
        ipcRenderer.send('chat:restart', true)
    })

    $('input[name=input-stream-key]')[0].value = store.get('config.rs.streamKey')
    $('input[name=input-stream-key]').change(function(e) {
        let value = e.currentTarget.value
        console.log(value)
        store.set('config.rs.streamKey', value)
        ipcRenderer.send('stream:restart', true)
        ipcRenderer.send('chat:restart', true)
    })

});
