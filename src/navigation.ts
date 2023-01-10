import { QMainWindow, QStackedWidget } from '@nodegui/nodegui';
import { IScreen, ScreenType } from './ui/iscreen';

const win = new QMainWindow();

const globalStyleSheet = `
#screenroot {
  width: 720px;
  height: 640px;
  background-color: #fff;
  align-items: 'center';
  justify-content: 'center';
}
#screentitle {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 16px;
}
* {
  font-size: 16px;
}
QLabel {
  font-size: 14px;
}
QPushButton {
  padding: 10px;
  margin: 0;
}
QTextEdit {
  height: 30px;
}
`

class Navigation {
  private static instance: Navigation

  private screenStack: IScreen[] = []
  public stackedWidget: QStackedWidget = new QStackedWidget()

  public win = win

  public goBack(): boolean {
    if (this.screenStack.length <= 1)
      return false
    var res = this.screenStack.pop()
    if (res != undefined) {
      this.stackedWidget.setCurrentIndex(this.screenStack.length - 1)
      this.stackedWidget.removeWidget(res.mainWidget)
    }
    return res != undefined
  }

  public goTo(screen: IScreen, data: any): void {
    screen.init(data)
    this.screenStack.push(screen)
    this.stackedWidget.addWidget(screen.mainWidget)
    win.setStyleSheet(globalStyleSheet + screen.screenStyleSheet)
    this.stackedWidget.setCurrentIndex(this.screenStack.length - 1)
  }

  public goBackUntil(type: ScreenType) {
    var idx = -1
    for (var i = this.screenStack.length - 1; i >= 0; i--) {
      if (this.screenStack[i].type == type) {
        idx = i
        break
      }
    }
    if (idx >= 0) {
      this.stackedWidget.setCurrentIndex(idx)
      win.setStyleSheet(globalStyleSheet + this.screenStack[idx].screenStyleSheet)
      while (this.screenStack.length - 1 > idx) {
        var scr = this.screenStack.pop()
        if (scr) {
          this.stackedWidget.removeWidget(scr.mainWidget)
        }
      }
    }
  }

  public static getInstance(): Navigation {
    if (!Navigation.instance)
      Navigation.instance = new Navigation()
    return Navigation.instance
  }

  public screenIs(type: ScreenType): boolean {
    return this.screenStack[this.screenStack.length-1].type == type
  }
}

export const navigation = Navigation.getInstance()

export function initWindow(
  screen: IScreen
): void {
  win.setWindowTitle("Quiz Game");

  navigation.goTo(screen, null)

  win.setCentralWidget(navigation.stackedWidget);
  win.setStyleSheet(globalStyleSheet + screen.screenStyleSheet);
  win.show();

  (global as any).win = win;
}