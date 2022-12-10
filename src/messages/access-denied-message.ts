import { IMessage } from './imessage'

export class AccessDeniedMessage implements IMessage {
  public messageType = "accessDeined"
}