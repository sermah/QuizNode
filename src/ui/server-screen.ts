import { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QListWidget, QTextEdit, QTextEditLineWrapMode, QListWidgetItem, QScreen, QBoxLayout, QFrame, QVariant } from '@nodegui/nodegui';
import { IScreen, ScreenType } from './iscreen';


// init(name: string)
// deinit(unsub: (QListWidget) => {})
export class ServerScreen implements IScreen {
  public type = ScreenType.ServerScreen
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
  public serverName = "untitled"
  unsub: (lst: QListWidget) => void = () => {}

  // data is serverName: string
  public init(data: any) {
    this.serverName = data as string
  }

  public deinit() {
    this.unsub(this.lst_players)
  }

  lst_players = new QListWidget()

  public constructor(
    subscribeListWidget: (lst: QListWidget) => void,
    unsubscribeListWidget: (lst: QListWidget) => void,
    onStartGame: () => void,
    onBack: () => void
  ) {
    this.unsub = unsubscribeListWidget

    this.mainWidget.setObjectName("screenroot")

    const flx_rootLayout = new FlexLayout()
    this.mainWidget.setLayout(flx_rootLayout)

    const lbl_screenTitle = new QLabel()
    lbl_screenTitle.setObjectName("screentitle")
    lbl_screenTitle.setText("Server Control")

    this.lst_players.setObjectName("playerlist")
    subscribeListWidget(this.lst_players)

    const btn_gameStart = new QPushButton()
    btn_gameStart.setText("Start");
    btn_gameStart.addEventListener('clicked', onStartGame)

    const btn_back = new QPushButton()
    btn_back.setText("Back");
    btn_back.addEventListener('clicked', onBack)

    flx_rootLayout.addWidget(lbl_screenTitle)
    flx_rootLayout.addWidget(this.lst_players)
    flx_rootLayout.addWidget(btn_gameStart)
    flx_rootLayout.addWidget(btn_back)
  }
}