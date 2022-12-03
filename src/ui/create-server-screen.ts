import { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QListWidget, QTextEdit, QTextEditLineWrapMode, QListWidgetItem, QScreen, QBoxLayout, QFrame, QVariant } from '@nodegui/nodegui';
import { IScreen, ScreenType } from './iscreen';

export class CreateServerScreen implements IScreen {
  public type = ScreenType.CreateServerScreen
  public mainWidget = new QWidget();
  public screenStyleSheet =
    `
    #screenroot {
      width: 720px;
      height: 640px;
      background-color: #fff;
      align-items: 'center';
      justify-content: 'center';
    }
    #screentitle {
      font-size: 24px;
      font-weight: bold;
      padding: 1;
    }
    #servername {
      height: 36px; 
    }
  `
  public init(_: any) { }

  public constructor(
    onServerStart: (name: string) => void,
    onBack: () => void
  ) {
    this.mainWidget.setObjectName("screenroot");

    const flx_rootLayout = new FlexLayout();
    this.mainWidget.setLayout(flx_rootLayout);

    const lbl_screenTitle = new QLabel();
    lbl_screenTitle.setObjectName("screentitle");
    lbl_screenTitle.setText("Create Server");

    const ted_serverName = new QTextEdit();
    ted_serverName.setObjectName("servername");
    ted_serverName.setPlaceholderText("Server Name");
    ted_serverName.setAcceptRichText(false);
    ted_serverName.setLineWrapMode(QTextEditLineWrapMode.NoWrap);

    const btn_serverCreate = new QPushButton();
    btn_serverCreate.setText("Create");
    btn_serverCreate.addEventListener('clicked', (_) => {
      var name = ted_serverName.toPlainText();
      if (name.length != 0) onServerStart(name);
    })

    const btn_back = new QPushButton();
    btn_back.setText("Back");
    btn_back.addEventListener('clicked', onBack)

    flx_rootLayout.addWidget(lbl_screenTitle);
    flx_rootLayout.addWidget(ted_serverName);
    flx_rootLayout.addWidget(btn_serverCreate);
    flx_rootLayout.addWidget(btn_back);
  }
}