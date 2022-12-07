// var bonjour = require('bonjour')()
// const mdns = require('mdns');

import Bonjour, { Service } from "bonjour-service"


export class Server {
  bonjour: Bonjour
  service: Service | undefined
  
  public get running() : boolean {
    return this.service != undefined
  }
  

  constructor(bonjour: Bonjour) {
    this.bonjour = bonjour
  }
  
  public start(name: string) {
    this.service = this.bonjour.publish({ name: name, type: '_quiz._tcp', port: 1369 })
    // advertise a http server on port 4321
    // const ad = mdns.createAdvertisement(mdns.tcp('_quiz._tcp'), 1369);
    // ad.start();
    
    console.log("Started service \"" + name + '"')
  }

  public stop() {
    console.log("Stopping services...")
    this.bonjour.unpublishAll()
  }
  
}
