import { IMessage } from './imessage'

export class HelloMessage implements IMessage {
  public messageType = "hello"
  public results: Map<string, number>

  constructor(results: Map<string, number>) { this.results = results }
}