import { initWindow } from './screen'
import { startServer } from './server'
import { StartScreen } from './ui/start-screen'
import { viewModel } from './viewmodel'

var bonjour = require('bonjour')()

initWindow(viewModel.defaultStartScreen())

// browse for all http services
bonjour.find({ type: 'http' }, function (service: any) {
  console.log('Found an HTTP server:', service.name)
  viewModel.addServer(service)
  viewModel.printServers()
})