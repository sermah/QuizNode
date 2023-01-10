import { initWindow } from './navigation'
import { viewModel } from './viewmodel'
import Bonjour from 'bonjour-service'

initWindow(viewModel.makeStartScreen())

viewModel.browseServers()
