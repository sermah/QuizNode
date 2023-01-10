import { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QListWidget, QTextEdit, QTextEditLineWrapMode, QListWidgetItem, QScreen, QBoxLayout, QFrame, QVariant } from '@nodegui/nodegui';
import { IScreen, ScreenType } from './iscreen';

export class CreateServerScreen implements IScreen {
  public type = ScreenType.CreateServerScreen
  public mainWidget = new QWidget();
  public screenStyleSheet =
    `
    #servername {
      height: 30px;
    }
  `
  public init(_: any) { }
  public deinit() { }

  public constructor(
    onServerStart: (name: string) => void,
    onSelectQuiz: () => void,
    onBack: () => void
  ) {
    this.mainWidget.setObjectName("screenroot");

    const flx_rootLayout = new FlexLayout();
    this.mainWidget.setLayout(flx_rootLayout);

    const lbl_screenTitle = new QLabel();
    lbl_screenTitle.setObjectName("screentitle");
    lbl_screenTitle.setText("Создать сервер");

    const ted_serverName = new QTextEdit();
    ted_serverName.setObjectName("servername");
    ted_serverName.setPlaceholderText("Название сервера");
    ted_serverName.setAcceptRichText(false);
    ted_serverName.setLineWrapMode(QTextEditLineWrapMode.NoWrap);

    const btn_selectQuiz = new QPushButton();
    btn_selectQuiz.setText("Выбрать викторину");
    btn_selectQuiz.addEventListener('clicked', (_) => {
      onSelectQuiz()
    })
    btn_selectQuiz.setInlineStyle("margin-top: 8px;")

    const btn_serverCreate = new QPushButton();
    btn_serverCreate.setText("Создать");
    btn_serverCreate.addEventListener('clicked', (_) => {
      var name = ted_serverName.toPlainText();
      if (name.length != 0) onServerStart(name);
    })

    const btn_back = new QPushButton();
    btn_back.setText("Назад");
    btn_back.addEventListener('clicked', onBack)

    flx_rootLayout.addWidget(lbl_screenTitle);
    flx_rootLayout.addWidget(ted_serverName);
    flx_rootLayout.addWidget(btn_selectQuiz);
    flx_rootLayout.addWidget(btn_serverCreate);
    flx_rootLayout.addWidget(btn_back);
  }
}