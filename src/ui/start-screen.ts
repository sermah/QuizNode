import { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QListWidget, QTextEdit, QTextEditLineWrapMode, QListWidgetItem, QScreen, QBoxLayout, QFrame, QVariant } from '@nodegui/nodegui';
import { IScreen, ScreenType } from './iscreen';


export class StartScreen implements IScreen {
  public type = ScreenType.StartScreen
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
      height: 48px; 
    }
    `
  public init(_: any) { }

  public constructor(
    subscribeListWidget: (lst: QListWidget) => void,
    onCreateServer: () => void,
    onServerSelect: (data: any) => void
  ) {
    this.mainWidget.setObjectName("screenroot");

    const flx_rootLayout = new FlexLayout();
    this.mainWidget.setLayout(flx_rootLayout);

    const lbl_screenTitle = new QLabel();
    lbl_screenTitle.setObjectName("screentitle");
    lbl_screenTitle.setText("Quiz Game");

    const lst_servers = new QListWidget();
    lst_servers.setObjectName("serverlist")
    subscribeListWidget(lst_servers)

    const btn_createServer = new QPushButton();
    btn_createServer.setText("Create Server");
    btn_createServer.addEventListener('clicked', onCreateServer)

    flx_rootLayout.addWidget(lbl_screenTitle);
    flx_rootLayout.addWidget(lst_servers);
    flx_rootLayout.addWidget(btn_createServer);
  }
}