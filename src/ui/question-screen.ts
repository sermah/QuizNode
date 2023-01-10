import { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QListWidget, QTextEdit, QTextEditLineWrapMode, QListWidgetItem, QScreen, QBoxLayout, QFrame, QVariant, QGridLayout, QGroupBox, Direction, AlignmentFlag } from '@nodegui/nodegui'
import { IScreen, ScreenType } from './iscreen'
import { QuestionMessage } from '../messages/question-message'
import MiniSignal, { MiniSignalBinding } from 'mini-signals'

export class QuestionScreen implements IScreen {
  public type = ScreenType.QuestionScreen
  public mainWidget = new QWidget()
  public screenStyleSheet =
    `
    #question {
      font-size: 24px;
      padding: 8px 0;
    }
    #buttons_first, #buttons_second {
      margin: 2px;
      align-self: 'stretch';
      align-items: 'stretch';
      justify-content: 'center';
      flex-direction: row;
      margin-bottom: 8px;
    }
    #buttons_first *, #buttons_second * {
      flex-grow: 1;
      font-size: 20px;
    }
  `
  public init(_: any) { }
  public deinit() {
    this.unsub()
  }

  public unsub() {}

  timerStarts: number = 0
  timerNow: number = 0
  timer: NodeJS.Timer | undefined

  public constructor(
    question: QuestionMessage,
    timerSecs: number,
    subscribeToSignal: (qchanged: (q: QuestionMessage) => void) =>
      MiniSignalBinding,
    onAnswer: (num: number) => void, // 0-index
    onBack: () => void
  ) {
    this.mainWidget.setObjectName("screenroot")

    const flx_rootLayout = new FlexLayout()
    this.mainWidget.setLayout(flx_rootLayout)

    const lbl_screenTitle = new QLabel()
    lbl_screenTitle.setObjectName("screentitle")
    lbl_screenTitle.setText(`Вопрос ${question.questionsAmount[0]}/${question.questionsAmount[1]}`)

    const lbl_question = new QLabel()
    lbl_question.setObjectName("question")
    lbl_question.setText(question.question)
    lbl_question.setWordWrap(true)

    this.timerStarts = timerSecs
    this.timerNow = this.timerStarts

    const lbl_timer = new QLabel()

    var resetTimer = () => {
      this.timerNow = this.timerStarts
      clearInterval(this.timer)
      lbl_timer.setText(`Осталось ${this.timerNow} с`)
      lbl_timer.update()
      this.timer = setInterval(
        () => {
          this.timerNow--
          lbl_timer.setText(`Осталось ${this.timerNow} с`)
          lbl_timer.update()
          if (this.timerNow == 0)
            clearInterval(this.timer)
        },
        1000
      )
    }

    resetTimer()

    // const wdg_buttons = new QWidget()
    // wdg_buttons.setObjectName("buttons")
    // const col_buttons = new QBoxLayout(Direction.TopToBottom)
    // wdg_buttons.setLayout(col_buttons)

    const wdg_buttons_first = new QWidget()
    wdg_buttons_first.setObjectName("buttons_first")
    // col_buttons.addWidget(wdg_buttons_first)
    const row_first = new FlexLayout()
    wdg_buttons_first.setLayout(row_first)

    const wdg_buttons_second = new QWidget()
    wdg_buttons_second.setObjectName("buttons_second")
    // col_buttons.addWidget(wdg_buttons_second)
    const row_second = new FlexLayout()
    wdg_buttons_second.setLayout(row_second)

    var hideAll = () => {
      wdg_buttons_first.hide()
      wdg_buttons_second.hide()
      this.mainWidget.repaint()
    }

    const btn_answer1 = new QPushButton()
    btn_answer1.setText(question.firstAnswer)
    btn_answer1.setObjectName("answer1")
    btn_answer1.addEventListener('clicked', (_) => {
      btn_answer1.clearFocus()
      hideAll()
      onAnswer(0)
    })

    const btn_answer2 = new QPushButton()
    btn_answer2.setText(question.secondAnswer)
    btn_answer2.setObjectName("answer2")
    btn_answer2.addEventListener('clicked', (_) => {
      btn_answer2.clearFocus()
      hideAll()
      onAnswer(1)
    })

    const btn_answer3 = new QPushButton()
    btn_answer3.setText(question.thirdAnswer)
    btn_answer3.setObjectName("answer3")
    btn_answer3.addEventListener('clicked', (_) => {
      btn_answer3.clearFocus()
      hideAll()
      onAnswer(2)
    })

    const btn_answer4 = new QPushButton()
    btn_answer4.setText(question.fourthAnswer)
    btn_answer4.setObjectName("answer4")
    btn_answer4.addEventListener('clicked', (_) => {
      btn_answer4.clearFocus()
      hideAll()
      onAnswer(3)
    })

    row_first.addWidget(btn_answer1)
    row_first.addWidget(btn_answer2)
    row_second.addWidget(btn_answer3)
    row_second.addWidget(btn_answer4)

    // grd_buttonLayout.addWidget(btn_answer1, 0, 0)
    // grd_buttonLayout.addWidget(btn_answer2, 0, 1)
    // grd_buttonLayout.addWidget(btn_answer3, 1, 0)
    // grd_buttonLayout.addWidget(btn_answer4, 1, 1)

    // grd_buttonLayout.setColumnStretch(0, 1)
    // grd_buttonLayout.setColumnStretch(1, 1)
    // grd_buttonLayout.setRowMinimumHeight(0, 32)
    // grd_buttonLayout.setRowMinimumHeight(1, 32)

    const btn_back = new QPushButton()
    btn_back.setText("Покинуть игру")
    btn_back.addEventListener('clicked', onBack)

    flx_rootLayout.addWidget(lbl_screenTitle)
    flx_rootLayout.addWidget(lbl_question)
    flx_rootLayout.addWidget(lbl_timer)
    flx_rootLayout.addWidget(wdg_buttons_first)
    flx_rootLayout.addWidget(wdg_buttons_second)
    flx_rootLayout.addWidget(btn_back)

    var signal = subscribeToSignal(
      (q) => {
        lbl_screenTitle.setText(`Вопрос ${q.questionsAmount[0]}/${q.questionsAmount[1]}`)
        btn_answer1.setText(q.firstAnswer)
        btn_answer2.setText(q.secondAnswer)
        btn_answer3.setText(q.thirdAnswer)
        btn_answer4.setText(q.fourthAnswer)
        lbl_question.setText(q.question)
        wdg_buttons_first.show()
        wdg_buttons_second.show()
        this.mainWidget.repaint()
        resetTimer()
      }
    )

    this.unsub = () => {
      signal.detach()
    }
  }
}