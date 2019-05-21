$(document).ready(function(){
    $('input[name=switch-nms]')[0].checked = store.get('config.nms.enabled')
    $('input[name=switch-nms]').change(function(e) {
        console.log('(input[name=switch-nms]).change', e.currentTarget)
        if (e.currentTarget.checked) {
            ipcRenderer.send('switch:nms', true)
        } else {
            ipcRenderer.send('switch:nms', false)
        }
    })
    ipcRenderer.on('switch:nms', function(event, message) {
        store.set('config.nms.enabled', message)
    });
    store.onDidChange('config.nms.enabled', function(to, from) {
        $('input[name=switch-nms]').checked = to
    })

    // settings nms
    store.get('toggle.nms') ? $('.settings-nms').show() : $('.settings-nms').hide()
    $('.toggle-settings-nms').click(function() {
        let toggle = store.get('toggle.nms')
        if (toggle) {
            $('.settings-nms').hide()
        } else {
            $('.settings-nms').show()
        }
        store.set('toggle.nms', !toggle)
    })

    $('input[name=input-video-bitrate]')[0].value = store.get('config.rs.videoBitrate')
    $('input[name=input-video-bitrate]').change(function(e) {
        let value = e.currentTarget.value
        store.set('config.rs.videoBitrate', value)
    })
    
    $('input[name=input-audio-bitrate]')[0].value = store.get('config.rs.audioBitrate')
    $('input[name=input-audio-bitrate]').change(function(e) {
        let value = e.currentTarget.value
        store.set('config.rs.audioBitrate', value)
    })
    
    $('input[name=input-screen-width]')[0].value = store.get('config.rs.screenWidth')
    $('input[name=input-screen-width]').change(function(e) {
        let value = e.currentTarget.value
        store.set('config.rs.screenWidth', value)
    })
    
    $('input[name=input-screen-height]')[0].value = store.get('config.rs.screenHeight')
    $('input[name=input-screen-height]').change(function(e) {
        let value = e.currentTarget.value
        store.set('config.rs.screenHeight', value)
    })
    
})
