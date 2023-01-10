import { Connection } from './connection'
import { HelloMessage } from './messages/hello-message'
import { IMessage } from './messages/imessage'

const logtag = "[CLIENT] "

export class Client {
  name = "Player"
  onConnect: () => void = () => {}
  onDisconnect: () => void = () => {}
  onMessage: (msg: IMessage) => void = () => {}

  connection = new Connection(
    undefined, logtag, true,
    () => {
      this.connection.send(new HelloMessage(this.name))
      this.connection.receive()
      this.onConnect()
    },
    () => this.onDisconnect(),
    (msg) => this.onMessage(msg),
  )

  public connect(service: any, name: string) {
    this.name = name
    this.connection.connect(service)
  }

  public disconnect() {
    this.connection.disconnect()
  }

  public send(data: any) {
    this.connection.send(data)
  }
}
