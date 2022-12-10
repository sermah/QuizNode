import { timeStamp } from 'console'
import net, { Socket } from 'net'
import { HelloMessage } from './messages/hello-message'
import { IMessage } from './messages/imessage'
import { fromJSONBytes } from './util/conversion'

var logtag = "[CLIENT] "

export class Client {
  sock = new net.Socket()
  onConnect: (playerList: string) => void = () => {}
  onDisconnect: () => void = () => {}
  onMessage: (msg: IMessage) => void = () => {}

  public connect(service: any) {
    console.log(service)
    
    this.sock.connect({ port: service.port, host: service.addresses[1] }, () => {
        console.log(logtag, `Connected to the server [${service.addresses[1]}]`)
        this.send(new HelloMessage("Player"))
        this.receive()
    })

    this.sock.on('end', () => {
        console.log(logtag, 'Connection ended.')
        this.onDisconnect()
    })

    this.sock.on('error', (err) => {
      console.log(logtag, 'Connection error: ', err.message)
      this.onDisconnect()
    })

    this.sock.on('timeout', () => {
      console.log(logtag, 'Connection timeout.')
      this.onDisconnect()
    })

    this.sock.on('close', () => {
      console.log(logtag, 'Connection closed.')
      this.onDisconnect()
    })

    this.sock.on('readable', () => {
      this.receive()
    })
  }

  public async disconnect() {
    this.sock.end()
    console.log(logtag, 'Disconnected from server.')
  }

  public async send(data: any) {
    const jdata = JSON.stringify(data)
    const jsize = (new TextEncoder().encode(jdata)).length
    const arr = new ArrayBuffer(2)
    const u16 = new Uint16Array(arr)
    const u8s = new Uint8Array(arr)
    u16[0] = jsize
    
    this.sock.write(u8s, (err) => {
      if (err) {
        console.log(logtag, "Failed sending data size.")
      }
    })
    this.sock.write(jdata, (err) => {
      if (err) {
        console.log(logtag, "Failed sending data.")
      }
    })
  }

  public async receive() {
    var size: number = (new Uint16Array(this.sock.read(2)))[0]
    if (size == 0) {
      return
    }

    var dataBuf = this.sock.read(size)
    if (dataBuf) {
      var obj = fromJSONBytes(dataBuf)
  
      if (obj?.messageType) this.onMessage(obj)
      else {
        console.log(logtag, "Received unknown data:\n", obj)
      }
    }
  }
}
