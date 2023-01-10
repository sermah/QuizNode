import { randomUUID } from 'crypto'
import net from 'net'
import { IMessage } from './messages/imessage'
import { fromJSONBytes } from './util/conversion'

export class Connection {
  socket = new net.Socket()
  bytesRead = 0
  bytesTotal = 0
  readBuffer = new Uint8Array()
  logtag = ""
  id = ""
  doLog = false
  onConnect: () => void = () => { }
  onDisconnect: () => void = () => { }
  onMessage: (msg: IMessage) => void = () => { }

  constructor(
    socket?: net.Socket,
    logtag?: string,
    doLog?: boolean,
    onConnect?: () => void,
    onDisconnect?: () => void,
    onMessage?: (msg: IMessage) => void,
  ) {
    this.id = randomUUID()
    if (socket) this.socket = socket
    if (logtag) this.logtag = logtag
    if (doLog) this.doLog = doLog
    if (onConnect) this.onConnect = onConnect
    if (onDisconnect) this.onDisconnect = onDisconnect
    if (onMessage) this.onMessage = onMessage

    this.socket.on('end', () => {
      this.log('Connection ended.')
    })

    this.socket.on('error', (err) => {
      this.log('Connection error: ', err.message)
    })

    this.socket.on('timeout', () => {
      this.log('Connection timeout.')
    })

    this.socket.on('close', () => {
      this.log('Connection closed.')
      this.onDisconnect()
    })

    this.socket.on('readable', () => {
      this.receive()
    })
  }

  public async connect(service: any) {
    this.socket.connect({ port: service.port, host: service.addresses[1] }, () => {
      this.log(`Connected to [${service.addresses[1]}]`)
      this.onConnect()
    })
  }

  public async disconnect() {
    this.socket.end()
    this.log('Disconnected from server.')
  }

  public async send(data: any) {
    const jdata = JSON.stringify(data)
    const jsize = (new TextEncoder().encode(jdata)).length
    // this.log("Sending ", jsize, " bytes")
    const arr = new ArrayBuffer(2)
    const u8s = new Uint8Array(arr)
    u8s[0] = jsize / 256
    u8s[1] = jsize % 256

    this.socket.write(u8s, (err) => {
      if (err) {
        this.log("Failed sending data size.")
      }
    })
    this.socket.write(jdata, (err) => {
      if (err) {
        this.log("Failed sending data.")
      }
    })
  }

  public async receive() {
    if (this.bytesRead == this.bytesTotal) {
      var bytes: ArrayBuffer = this.socket.read(2)
      if (!bytes) return
      var total = (new Uint8Array(bytes))[0] * 256 + (new Uint8Array(bytes))[1]
      this.bytesRead = 0
      this.bytesTotal = total
      this.readBuffer = new Uint8Array(this.bytesTotal)
      // this.log("Reading ", this.bytesTotal, " bytes")
    }


    if (this.bytesTotal == this.bytesRead)
      return

    var dataBuf: Uint8Array = this.socket.read(this.bytesTotal)

    if (dataBuf) {
      this.readBuffer.set(dataBuf, this.bytesRead)
      this.bytesRead += dataBuf.byteLength

      if (this.bytesRead == this.bytesTotal) {
        var obj = fromJSONBytes(dataBuf)

        if (obj?.messageType) this.onMessage(obj)
        else {
          this.log("Received unknown data:\n", obj)
        }
      }
    }
    // this.log("Read ", this.bytesRead, " bytes")
  }

  private log(...args: any[]) {
    if (this.doLog)
      console.log(this.logtag, ...args)
  }
}