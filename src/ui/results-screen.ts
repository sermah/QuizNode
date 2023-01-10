import { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QListWidget, QTextEdit, QTextEditLineWrapMode, QListWidgetItem, QScreen, QBoxLayout, QFrame, QVariant, Direction } from '@nodegui/nodegui';
import { MiniSignalBinding } from 'mini-signals';
import { ResultsMessage } from '../messages/results-message';
import { IScreen, ScreenType } from './iscreen';


// init(name: string)
// deinit(unsub: (QListWidget) => {})
export class ResultsScreen implements IScreen {
  public type = ScreenType.ResultsScreen
  public mainWidget = new QWidget()
  public screenStyleSheet =
    ``
  public serverName = "untitled"

  public init(data: any) {}

  public deinit() {}

  public constructor(
    title: string,
    results: ResultsMessage,
    score: number | undefined,
    onBack: () => void
  ) {
    this.mainWidget.setObjectName("screenroot")

    const flx_rootLayout = new FlexLayout()
    this.mainWidget.setLayout(flx_rootLayout)

    const lbl_screenTitle = new QLabel()
    lbl_screenTitle.setObjectName("screentitle")
    lbl_screenTitle.setText(`Результаты - ${title}`)
    lbl_screenTitle.setWordWrap(true)
    flx_rootLayout.addWidget(lbl_screenTitle)

    const lbl_score = new QLabel()
    lbl_score.setObjectName("score")
    lbl_score.setWordWrap(true)
    lbl_score.setStyleSheet("font-size: 20px; margin: 0 0 2px;")
    flx_rootLayout.addWidget(lbl_score)
    if (score != undefined)
      lbl_score.setText(`Вы ответили правильно на ${score} вопросов!`)
    else
      lbl_score.setText(`Победитель - ${results.results[0]?.[0] ?? "не найден!"}`)

    var resSorted = results.results
    var counter = 1
    resSorted.forEach(([k, v]) => {
      console.log([k, v])
      var lbl_other_score = new QLabel()
      lbl_other_score.setText(`${counter++}) ${k} - ${v} оч.`)
      lbl_other_score.setStyleSheet("font-size: 18px; margin: 0 0 2px;")
      flx_rootLayout.addWidget(lbl_other_score)
    });

    const btn_back = new QPushButton()
    btn_back.setText("Назад");
    btn_back.setStyleSheet("margin: 4px 0;")
    btn_back.addEventListener('clicked', onBack)

    flx_rootLayout.addWidget(btn_back)
  }
}