// var bonjour = require('bonjour')()
// const mdns = require('mdns')

import Bonjour, { Service } from "bonjour-service"
import net, { Socket } from 'net'
import { AccessDeniedMessage } from "./messages/access-denied-message"
import { IMessage } from "./messages/imessage"
import { fromJSONBytes, toJSON, toJSONBytes } from "./util/conversion"

const PORT = 1369
var logtag = "[SERVER] "

export class Server {
  bonjour: Bonjour
  service: Service | undefined
  server: net.Server | undefined
  maxPlayers: number
  
  namesByUUID:   Map<string, string> = new Map()
  socketsByUUID: Map<string, Socket> = new Map()
  answersByUUID: Map<string, number> = new Map()

  onMessage: (msg: IMessage, id: string) => void = () => {}

  public get connections(): number {
    return this.server?.connections ?? 0
  }
  
  public get running() : boolean {
    return this.service != undefined
  }
  
  constructor(
    bonjour: Bonjour,
    maxPlayers: number
  ) {
    this.bonjour = bonjour
    this.maxPlayers = maxPlayers
  }

  private onClientConnected(sock: Socket) {
    var remoteAddress = sock.remoteAddress + ':' + sock.remotePort

    console.log(logtag, `New client connected - [${remoteAddress}]`)

    if (this.connections >= this.maxPlayers) {
      console.log(logtag, `Max players already reached - [${remoteAddress}] disconnected`)
      sock.write(toJSON(new AccessDeniedMessage()))
      sock.end()
    }


    sock.on('end', () => {
      console.log(logtag, `Connection [${remoteAddress}] ended.`, )
    })

    sock.on('error', (err) => {
      console.log(logtag, `Connection [${remoteAddress}] error: `, err.message)
    })

    sock.on('timeout', () => {
      console.log(logtag, `Connection [${remoteAddress}] timeout.`)
    })

    sock.on('close', () => {
      console.log(logtag, `Connection [${remoteAddress}] closed.`)
    })

    sock.on('readable', () => {
      this.receive(sock)
    })
  }

  
  public start(name: string) {
    this.service = this.bonjour.publish({ 
      name: name, 
      type: 'quiz', 
      port: PORT,
      protocol: 'tcp'
    })
    // advertise a http server on port 4321
    // const ad = mdns.createAdvertisement(mdns.tcp('_quiz._tcp'), 1369)
    // ad.start()

    this.server = net.createServer((sock) => this.onClientConnected(sock))  

    this.server.listen(PORT, () => {
      console.log(logtag, 'Server listening on %j', this.server?.address())
    })

    console.log(logtag, "Started service \"" + name + '"')
  }

  public async stop() {
    console.log(logtag, "Stopping services...")
    this.bonjour.unpublishAll()
    this.server?.close()
    this.service = undefined
  }

  // public async removeSocket(sock: Socket) {
  //   var toRemove: string[] = []
  //   this.socketsByUUID.forEach((val, key) => {
  //     if (val == sock) toRemove.push(key)
  //   })
  //   toRemove.forEach((val, _) => {
  //     this.socketsByUUID.delete(val)
  //     this.namesByUUID.delete(val)
  //     this.answersByUUID.delete(val)
  //   })
  // }

  public async sendByID(data: any, to: string) {
    var sock = this.socketsByUUID.get(to)

    if (sock) {
      const jdata = JSON.stringify(data)
      const jsize = (new TextEncoder().encode(jdata)).length
      const arr = new ArrayBuffer(2)
      const u16 = new Uint16Array(arr)
      const u8s = new Uint8Array(arr)
      u16[0] = jsize
  
      
      sock.write(u8s, (err) => {
        if (err) {
          console.log(logtag, "Failed sending data size.")
        }
      })
      sock.write(jdata, (err) => {
        if (err) {
          console.log(logtag, "Failed sending data.")
        }
      })
    }
  }

  public async sendToAll(data: any) {
    for (const id of this.socketsByUUID.keys()) {
      this.sendByID(data, id)
    }
  }

  public async receive(sock: Socket) {
    var size: number = (new Uint16Array(sock.read(2)))[0]
    if (size == 0) {
      return
    }

    var dataBuf = sock.read(size)
    if (dataBuf) {
      var obj = fromJSONBytes(dataBuf)

      if (obj?.messageType) this.onMessage(obj, this.findSocketUUID(sock))
      else {
        console.log(logtag, "Received unknown data:\n", obj)
      }
    }
  }

  public findSocketUUID(target: Socket): string {
    this.socketsByUUID.forEach((sock, id) => {
      if (sock == target) return id
    });
    return ""
  }
  
  // Game

  public addAnswer(id: string, answer: number) {
    console.log(this.namesByUUID.get)
    this.answersByUUID.set(id, 
      (this.answersByUUID.get(id) ?? 0) + answer)
  }

  public addNewName(id: string, name: string) {
    this.namesByUUID.set(id, name)
    this.answersByUUID.set(id, 0)
    console.log(logtag, `Added Player - ${name}`)
  }

}
