import { IMessage } from './imessage'

export class ResultsMessage implements IMessage {
  public messageType = "results"
  public results: [string, any][]

  constructor(results: [string, any][]) { this.results = results }
}