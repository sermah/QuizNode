import { initWindow } from './screen'
import { StartScreen } from './ui/start-screen'
import { ViewModel } from './viewmodel'

var bonjour = require('bonjour')()
var MiniSignal = require('mini-signals')

var vm = ViewModel.getInstance()

const startScreen = new StartScreen(
  vm.listSignal,
  function(name: String) {
    // TODO: Make good name thing
    var goodName = name.replace(/' '/g, ' ');
    // advertise an HTTP server on port 3000
    var service = bonjour.publish({ name: goodName, type: 'http', port: 3000 })
    console.log("Started server \"" + goodName + '"')
})

initWindow(startScreen)

// browse for all http services
bonjour.find({ type: 'http' }, function (service: any) {
  console.log('Found an HTTP server:', service.name)
  vm.addServer(service)
  vm.printServers()
})