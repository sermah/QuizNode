import { IMessage } from './imessage'

export class PlayersMessage implements IMessage {
  public messageType = "players"
  public playersAmount: string
  public maxPlayersAmount: string
  public playersName: string[]

  constructor(
    playersAmount: string,
    maxPlayersAmount: string,
    playersName: string[],
  ) {
    this.playersAmount = playersAmount
    this.maxPlayersAmount = maxPlayersAmount
    this.playersName = playersName
  }
}