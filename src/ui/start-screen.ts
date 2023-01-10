import { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QListWidget, QTextEdit, QTextEditLineWrapMode, QListWidgetItem, QScreen, QBoxLayout, QFrame, QVariant, QObject, ItemDataRole } from '@nodegui/nodegui';
import { randomInt } from 'crypto';
import { IScreen, ScreenType } from './iscreen';


export class StartScreen implements IScreen {
  public type = ScreenType.StartScreen
  public mainWidget = new QWidget();
  public screenStyleSheet =
    `
    #playername {
      height: 30px;
    }
    #joinhint {
      max-width: 600px;
      margin: 8px 0;
    }

    `
  public init(_: any) { }
  public deinit() { }

  public constructor(
    subscribeListWidget: (lst: QListWidget) => void,
    onCreateServer: () => void,
    onServerSelect: (data: any, name: string) => void
  ) {
    this.mainWidget.setObjectName("screenroot");

    const flx_rootLayout = new FlexLayout();
    this.mainWidget.setLayout(flx_rootLayout);

    const lbl_screenTitle = new QLabel();
    lbl_screenTitle.setObjectName("screentitle");
    lbl_screenTitle.setText("Викторина");
    lbl_screenTitle.setWordWrap(true)

    const ted_playerName = new QTextEdit()
    ted_playerName.setObjectName("playername");
    ted_playerName.setText("Игрок" + (randomInt(8999) + 1000).toString())
    ted_playerName.setPlaceholderText("Ваше имя")

    const lbl_joinHint = new QLabel();
    lbl_joinHint.setObjectName("joinhint");
    lbl_joinHint.setText("Нажмите на название игры в списке ниже, чтобы присоединиться");
    lbl_joinHint.setWordWrap(true)

    const lst_servers = new QListWidget();
    lst_servers.setObjectName("serverlist")
    subscribeListWidget(lst_servers)
    lst_servers.addEventListener('itemClicked', (item) => {
      var nick = ted_playerName.toPlainText().trim()
      if (nick.length > 0)
        onServerSelect(JSON.parse(item.data(ItemDataRole.UserRole).toString()), nick)
    })

    const btn_createServer = new QPushButton();
    btn_createServer.setText("Создать сервер");
    btn_createServer.addEventListener('clicked', onCreateServer)

    flx_rootLayout.addWidget(lbl_screenTitle);
    flx_rootLayout.addWidget(ted_playerName);
    flx_rootLayout.addWidget(lbl_joinHint);
    flx_rootLayout.addWidget(lst_servers);
    flx_rootLayout.addWidget(btn_createServer);
  }
}