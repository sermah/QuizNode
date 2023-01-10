import { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QListWidget, QTextEdit, QTextEditLineWrapMode, QListWidgetItem, QScreen, QBoxLayout, QFrame, QVariant, Direction, QFileDialog, FileMode, AcceptMode, QObject, QWidgetSignals, QScrollArea, TextFormat, ScrollBarPolicy } from '@nodegui/nodegui';
import { MiniSignalBinding } from 'mini-signals';
import { QuestionMessage } from '../messages/question-message';
import { ResultsMessage } from '../messages/results-message';
import { IScreen, ScreenType } from './iscreen';
import {navigation} from '../navigation'

export class QuizPickScreen implements IScreen {
  public type = ScreenType.QuizPickScreen
  public mainWidget = new QWidget()
  public screenStyleSheet =
    `
    #qsPreview {
      min-width: 400px;
      min-height: 400px;
      max-height: 900px;
    }
    `
  public serverName = "untitled"

  public init(data: any) {}

  public deinit() {}

  public constructor(
    qs: QuestionMessage[],
    fileName: string,
    onPickFile: (name: string, cb?: (newqs: QuestionMessage[], newfn: string) => void) => void,
    onBack: () => void
  ) {
    this.mainWidget.setObjectName("screenroot")

    const flx_rootLayout = new FlexLayout()
    this.mainWidget.setLayout(flx_rootLayout)

    const lbl_screenTitle = new QLabel()
    lbl_screenTitle.setObjectName("screentitle")
    lbl_screenTitle.setText(`Выбор викторины`)

    const lbl_preview = new QLabel()
    lbl_preview.setStyleSheet("font-size: 16px; margin-bottom: 8px;")

    var wdg_previewScroll = new QScrollArea()
    wdg_previewScroll.setObjectName("qsPreview")
    wdg_previewScroll.setVerticalScrollBarPolicy(ScrollBarPolicy.ScrollBarAlwaysOn)
    wdg_previewScroll.setHorizontalScrollBarPolicy(ScrollBarPolicy.ScrollBarAlwaysOff)
    wdg_previewScroll.setWidgetResizable(true)
    var wdg_qsPreview = new QWidget()
    var bxl_qsPreview = new QBoxLayout(Direction.TopToBottom, wdg_qsPreview)
    var labels : QWidget[] = []
    var updQs = (nqs: QuestionMessage[], nfn: string) => {
      lbl_preview.setText(`Просмотр - ${nfn}`)
      labels.forEach((wd) => {
        bxl_qsPreview.removeWidget(wd)
        wd.delete()
      })
      labels = []
      nqs.forEach(qm => {
        var lbl_question = new QLabel()
        lbl_question.setWordWrap(true)
        lbl_question.setText(`Вопрос: "${qm.question}"`)
        lbl_question.setStyleSheet("font-size: 18px; font-weight: bold; margin: 0 0 2px;")
        labels.push(lbl_question)
        var lbl_firstAns = new QLabel()
        lbl_firstAns.setWordWrap(true)
        lbl_firstAns.setText(`1) "${qm.firstAnswer}"`)
        if (qm.firstAnswer == qm.answer)
          lbl_firstAns.setInlineStyle("text-decoration: underline;")
        lbl_firstAns.setStyleSheet("font-size: 16px; margin: 0 0 2px;")
        labels.push(lbl_firstAns)
        var lbl_secondAns = new QLabel()
        lbl_secondAns.setWordWrap(true)
        lbl_secondAns.setText(`2) "${qm.secondAnswer}"`)
        if (qm.secondAnswer == qm.answer)
          lbl_secondAns.setInlineStyle("text-decoration: underline;")
        lbl_secondAns.setStyleSheet("font-size: 16px; margin: 0 0 2px;")
        labels.push(lbl_secondAns)
        var lbl_thirdAns = new QLabel()
        lbl_thirdAns.setWordWrap(true)
        lbl_thirdAns.setText(`3) "${qm.thirdAnswer}"`)
        if (qm.thirdAnswer == qm.answer)
          lbl_thirdAns.setInlineStyle("text-decoration: underline;")
        lbl_thirdAns.setStyleSheet("font-size: 16px; margin: 0 0 2px;")
        labels.push(lbl_thirdAns)
        var lbl_fourthAns = new QLabel()
        lbl_fourthAns.setWordWrap(true)
        lbl_fourthAns.setText(`4) "${qm.fourthAnswer}"`)
        if (qm.fourthAnswer == qm.answer)
          lbl_fourthAns.setInlineStyle("text-decoration: underline;")
        lbl_fourthAns.setStyleSheet("font-size: 16px; margin: 0 0 2px;")
        labels.push(lbl_fourthAns)
      });
      labels.forEach(wd => {
        bxl_qsPreview.addWidget(wd)
      });
      wdg_qsPreview.update()
    }

    updQs(qs, fileName)
    wdg_qsPreview.setUpdatesEnabled(true)
    wdg_previewScroll.setUpdatesEnabled(true)
    wdg_previewScroll.setWidget(wdg_qsPreview)

    const btn_pick = new QPushButton()
    btn_pick.setText("Выбрать файл");
    btn_pick.setStyleSheet("margin: 4px 0 0;")
    btn_pick.addEventListener('clicked', () => {
      const fid_quizPicker = new QFileDialog()
      fid_quizPicker.setAcceptDrops(true)
      fid_quizPicker.setFileMode(FileMode.ExistingFile)
      fid_quizPicker.setNameFilter("*.txt")
      fid_quizPicker.setAcceptMode(AcceptMode.AcceptOpen)
      if (fid_quizPicker.exec())
        onPickFile(fid_quizPicker.selectedFiles()[0], (nqs, nfn) => {
          updQs(nqs, nfn)
          navigation.win.update()
        })
    })

    const btn_back = new QPushButton()
    btn_back.setText("Применить");
    btn_back.addEventListener('clicked', onBack)

    flx_rootLayout.addWidget(lbl_screenTitle)
    flx_rootLayout.addWidget(lbl_preview)
    flx_rootLayout.addWidget(wdg_previewScroll)
    flx_rootLayout.addWidget(btn_pick)
    flx_rootLayout.addWidget(btn_back)
  }
}