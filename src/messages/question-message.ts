import { IMessage } from './imessage'

export class QuestionMessage implements IMessage {
  public messageType = "question"
  public question: string
  public firstAnswer: string
  public secondAnswer: string
  public thirdAnswer: string
  public fourthAnswer: string
  public answer: string
  public questionsAmount: number[]

  constructor(
    question: string,
    firstAnswer: string,
    secondAnswer: string,
    thirdAnswer: string,
    fourthAnswer: string,
    answer: string,
    questionsAmount: number[],
  ) {
    this.question = question
    this.firstAnswer = firstAnswer
    this.secondAnswer = secondAnswer
    this.thirdAnswer = thirdAnswer
    this.fourthAnswer = fourthAnswer
    this.answer = answer
    this.questionsAmount = questionsAmount
  }
}