import { IMessage } from './imessage'

export class HelloMessage implements IMessage {
  public messageType = "hello"
  public name: string

  constructor(name: string) { this.name = name }
}