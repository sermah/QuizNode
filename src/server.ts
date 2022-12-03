var bonjour = require('bonjour')()

export function startServer(name: String) {
  var service = bonjour.publish({ name: name, type: 'http', port: 1369 })
  console.log("Started server \"" + name + '"')
}