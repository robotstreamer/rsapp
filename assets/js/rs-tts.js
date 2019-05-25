$(document).ready(function() {
    $('input[name=switch-tts]')[0].checked = store.get('config.rs.tts_enabled')
    $('input[name=switch-tts]').change(function(e) {
        console.log(e)
        if (e.currentTarget.checked) {
            ipcRenderer.send('switch:tts', true)
        } else {
            ipcRenderer.send('switch:tts', false)
        }
        e.currentTarget.disabled = true
        setTimeout(function(){
            e.currentTarget.disabled = false
        },2000)

    })
    ipcRenderer.on('switch:tts', function(event, message) {
        store.set('config.rs.tts_enabled', message)
    });
    store.onDidChange('switch-tts', function(to, from) {
        $('input[name=switch-tts]').checked = to
    })

    $('select[name=select-tts-voice]')[0].value = store.get('config.rs.tts_voice') || ""
    $('select[name=select-tts-voice]').change(function(e) {
        console.log(e.currentTarget.value)
        let voice = e.currentTarget.value
        if (voice) {
            ipcRenderer.send('select:tts:voice', voice)
        }
    })

    $('input[name=input-tts-extra]')[0].value = store.get('config.rs.tts_extra') || ""
    $('input[name=input-tts-extra]').on('change keyup copy paste cut', function(e) {
        console.log(e.currentTarget.value)
        let extra = e.currentTarget.value
        ipcRenderer.send('input:tts:extra', extra)
    })

    $('select[name=select-tts-speed]')[0].value = store.get('config.rs.tts_speed') || ""
    $('select[name=select-tts-speed]').change(function(e) {
        console.log(e.currentTarget.value)
        let speed = e.currentTarget.value
        if (speed) {
            ipcRenderer.send('select:tts:speed', speed)
        }
    })

    $('button[name=button-tts-test]').click(function(e) {
        ipcRenderer.send('button:tts:test')
        document.activeElement.blur()
    })

    $('input[name=input-tts-pausetime]')[0].value = store.get('config.rs.tts_pausetime') || 0
    $('input[name=input-tts-pausetime]').change(function(e) {
        let value = Number(e.currentTarget.value)
        ipcRenderer.send('input:tts:pausetime', value)
    })

    $('input[name=input-tts-queuemax]')[0].value = store.get('config.rs.tts_queuemax') || 20
    $('input[name=input-tts-queuemax]').change(function(e) {
        let value = Number(e.currentTarget.value)
        if (value) {
            ipcRenderer.send('input:tts:queuemax', value)
        }
    })

    $('button[name=button-tts-queueclear]').click(function(e) {
        ipcRenderer.send('button:tts:queueclear')
        document.activeElement.blur()
    })

    ipcRenderer.on('status:tts:messages', function(event, message) {
        $('input[name=input-tts-queuestatus]')[0].value = message || 0
    });

    store.get('toggle.tts') ? $('.settings-tts').show() : $('.settings-tts').hide()
    $('.toggle-settings-tts').click(function(){
        let toggle = store.get('toggle.tts')
        if (toggle) {
            $('.settings-tts').hide()
        } else {
            $('.settings-tts').show()
        }
        store.set('toggle.tts',!toggle)
    })


});
