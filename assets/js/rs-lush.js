$(document).ready(function() {

    $('.plugin-lush').css('display', store.get('config.plugins.lush') ? 'block' : 'none')
    ipcRenderer.on('config.plugins.lush', function(event, message) {
      console.log(message)
        store.set('config.plugins.lush', message)
    });
    store.onDidChange('config.plugins.lush', function(){
      $('.plugin-lush').css('display', store.get('config.plugins.lush') ? 'block' : 'none')
    })

    store.get('toggle.lush') ? $('.settings-lush').show() : $('.settings-lush').hide()
    $('.toggle-settings-lush').click(function(){
        let toggle = store.get('toggle.lush')
        if (toggle) {
            $('.settings-lush').hide()
        } else {
            $('.settings-lush').show()
        }
        store.set('toggle.lush',!toggle)
    })
    $('input[name=switch-lush]')[0].checked = store.get('config.rs.lush_enabled')
    $('input[name=switch-lush]').change(function(e) {
        console.log(e)
        if (e.currentTarget.checked) {
            ipcRenderer.send('switch:lush', true)
        } else {
            ipcRenderer.send('switch:lush', false)
        }
        e.currentTarget.disabled = true
        setTimeout(function(){
            e.currentTarget.disabled = false
        },2000)
    })


    $('select[name=select-lush-volume]')[0].value = store.get('config.rs.lush_volume') || ""
    $('select[name=select-lush-volume]').change(function(e) {
        console.log(e.currentTarget.value)
        let value = e.currentTarget.value
        if (value) {
            ipcRenderer.send('select:lush:volume', value)
        }
    })

    $('button[name=button-lush-test]').click(function(e) {
        ipcRenderer.send('button:lush:test')
        document.activeElement.blur()
    })

});
