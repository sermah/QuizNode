import { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QListWidget, QTextEdit, QTextEditLineWrapMode, QListWidgetItem, QScreen, QBoxLayout, QFrame, QVariant } from '@nodegui/nodegui';
import { MiniSignalBinding } from 'mini-signals';
import { IScreen, ScreenType } from './iscreen';


// init(name: string)
// deinit(unsub: (QListWidget) => {})
export class WaitingScreen implements IScreen {
  public type = ScreenType.WaitingScreen
  public mainWidget = new QWidget()
  public screenStyleSheet =
    ``
  public serverName = "untitled"
  lst_bind: MiniSignalBinding | undefined
  unsub: (bind: MiniSignalBinding) => void = () => {}

  public init(data: any) {}

  public deinit() {
    if (this.lst_bind)
      this.unsub(this.lst_bind)
  }

  lst_players = new QListWidget()

  public constructor(
    title: string,
    subscribeListWidget: (lst: QListWidget) => MiniSignalBinding,
    unsubscribeListWidget: (bind: MiniSignalBinding) => void,
    onBack: () => void
  ) {
    this.unsub = unsubscribeListWidget

    this.mainWidget.setObjectName("screenroot")

    const flx_rootLayout = new FlexLayout()
    this.mainWidget.setLayout(flx_rootLayout)

    const lbl_screenTitle = new QLabel()
    lbl_screenTitle.setObjectName("screentitle")
    lbl_screenTitle.setText(`Игра - ${title}`)

    this.lst_players.setObjectName("playerlist")
    this.lst_bind = subscribeListWidget(this.lst_players)

    const btn_back = new QPushButton()
    btn_back.setText("Покинуть игру");
    btn_back.addEventListener('clicked', onBack)

    flx_rootLayout.addWidget(lbl_screenTitle)
    flx_rootLayout.addWidget(this.lst_players)
    flx_rootLayout.addWidget(btn_back)
  }
}