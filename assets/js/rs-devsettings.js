$(document).ready(function() {

    store.get('toggle.dev') ? $('.settings-dev').show() : $('.settings-dev').hide()
    $('.toggle-settings-dev').click(function() {
        let toggle = store.get('toggle.dev')
        if (toggle) {
            $('.settings-dev').hide()
        } else {
            $('.settings-dev').show()
        }
        store.set('toggle.dev', !toggle)
    })

    $('input[name=input-api-host]')[0].value = store.get('config.rs.api_host')
    $('input[name=input-api-host]').change(function(e) {
        let value = e.currentTarget.value
        store.set('config.rs.api_host', value)
        ipcRenderer.send('stream:restart', true)
    })

    $('input[name=input-api-port]')[0].value = store.get('config.rs.api_port')
    $('input[name=input-api-port]').change(function(e) {
        let value = e.currentTarget.value
        store.set('config.rs.api_port', value)
        ipcRenderer.send('stream:restart', true)
    })

    $('input[name=input-api-protocol]')[0].value = store.get('config.rs.api_protocol')
    $('input[name=input-api-protocol]').change(function(e) {
        let value = e.currentTarget.value
        store.set('config.rs.api_protocol', value)
        ipcRenderer.send('stream:restart', true)
    })

    $('input[name=input-chat-host]')[0].value = store.get('config.rs.chat_host')
    $('input[name=input-chat-host]').change(function(e) {
        let value = e.currentTarget.value
        store.set('config.rs.chat_host', value)
        ipcRenderer.send('chat:restart', true)
    })

    $('input[name=input-chat-port]')[0].value = store.get('config.rs.chat_port')
    $('input[name=input-chat-port]').change(function(e) {
        let value = e.currentTarget.value
        store.set('config.rs.chat_port', value)
        ipcRenderer.send('chat:restart', true)
    })

    $('input[name=input-chat-protocol]')[0].value = store.get('config.rs.chat_protocol')
    $('input[name=input-chat-protocol]').change(function(e) {
        let value = e.currentTarget.value
        store.set('config.rs.chat_protocol', value)
        ipcRenderer.send('chat:restart', true)
    })

});
