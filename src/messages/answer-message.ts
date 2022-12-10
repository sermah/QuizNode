import { IMessage } from './imessage'

export class AnswerMessage implements IMessage {
  public messageType = "answer"
  public answer: boolean

  constructor(answer: boolean) { this.answer = answer }
}