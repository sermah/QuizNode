import { initWindow } from './navigation'
import { viewModel } from './viewmodel'
import Bonjour from 'bonjour-service'

initWindow(viewModel.defaultStartScreen())

viewModel.browseServers()

// // import the module
// const mdns = require('mdns');
 
// // watch all http servers
// const browser = mdns.createBrowser(mdns.tcp('_quiz._tcp'));
// browser.on('serviceUp', (service: any) => {
//   viewModel.addServer(service)
// });

// browser.on('serviceDown', (service: any) => {
//   viewModel.removeServer(service)
// });

// browser.start();
 