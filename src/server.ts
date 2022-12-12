// var bonjour = require('bonjour')()
// const mdns = require('mdns')

import Bonjour, { Service } from "bonjour-service"
import net, { Socket } from 'net'
import { Connection } from "./connection"
import { AccessDeniedMessage } from "./messages/access-denied-message"
import { IMessage } from "./messages/imessage"
import { PlayersMessage } from "./messages/players-message"
import { fromJSONBytes, toJSON, toJSONBytes } from "./util/conversion"

const PORT = 1369
const logtag = "[SERVER] "

export class Server {
  bonjour: Bonjour
  service: Service | undefined
  server: net.Server | undefined
  maxPlayers: number
  
  connsByID:    Map<string, Connection> = new Map()
  answersByID:  Map<string, number> = new Map()
  namesByID:    Map<string, string> = new Map()

  onMessage: (msg: IMessage, conn: Connection) => void = () => {}

  public get players(): number {
    return this.namesByID.size
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

    if (this.players >= this.maxPlayers) {
      console.log(logtag, `Max players already reached - [${remoteAddress}] disconnected`)
      sock.write(toJSON(new AccessDeniedMessage()))
      sock.end()
    }

    var newConn = new Connection(
      sock, logtag, false,
      () => {},
      () => { this.removeConnection(newConn) },
      (msg) => { this.onMessage(msg, newConn) }
    )
  }
  
  public start(name: string) {
    this.service = this.bonjour.publish({ 
      name: name, 
      type: 'quiz', 
      port: PORT,
      protocol: 'tcp'
    })

    this.server = net.createServer((sock) => this.onClientConnected(sock))  

    this.server.listen(PORT, () => {
      console.log(logtag, 'Server listening on', this.server?.address())
    })

    console.log(logtag, "Started service \"" + name + '"')
  }

  public async stop() {
    console.log(logtag, "Stopping services...")
    this.bonjour.unpublishAll()
    this.server?.close()
    this.service = undefined
  }

  public async removeConnection(conn: Connection) {
    this.connsByID.delete(conn.id)
    this.namesByID.delete(conn.id)
    this.answersByID.delete(conn.id)
    this.sendPlayers()
  }

  public async sendToAll(data: any) {
    for (const conn of this.connsByID.values()) {
      conn.send(data)
    }
  }
  
  // Game

  public addAnswer(id: string, answer: number) {
    console.log(this.namesByID.get)
    this.answersByID.set(id, 
      (this.answersByID.get(id) ?? 0) + answer)
  }

  public addNewName(conn: Connection, name: string, cb: () => void) {
    this.namesByID.set(conn.id, name)
    this.answersByID.set(conn.id, 0)
    this.connsByID.set(conn.id, conn)
    this.sendPlayers()
    cb()
    console.log(logtag, `Added Player - ${name}`)
  }

  public sendPlayers() {
    this.sendToAll(new PlayersMessage(
      this.namesByID.size.toString(), 
      this.maxPlayers.toString(), 
      Array.from(this.namesByID.values())
    ))
  }
}
