import fs from 'fs'
import { QuestionMessage } from '../messages/question-message';

export function readQuiz(name: string, cb: (name: string, qs: QuestionMessage[]) => void) {
  fs.readFile(name, 'utf8', (err, data) => {
    if (err) {
      console.log("Failed reading '" + name + "'")
      console.log(err)
      return
    }
    console.log("Succesfully read '" + name + "'")
    var result: QuestionMessage[] = []
    var counter = 0
    var currQ: string[] = ["", "", "", "", "", ""]
    data.replace("\r","").split("\n").forEach(l => {
      l = l.trim()
      if (l.length == 0) return
      currQ[counter % 6] = l
      if (counter % 6 == 5) result.push(
        new QuestionMessage(
          currQ[0], currQ[1], currQ[2], currQ[3], currQ[4], currQ[5], []
        )
      )
      counter++
    })
    if (counter % 6 == 0) cb(name, result)
  })
}