import { QMainWindow, QStackedWidget } from '@nodegui/nodegui';
import { IScreen, ScreenType } from './ui/iscreen';

const win = new QMainWindow();

class Navigation {
  private static instance: Navigation

  private screenStack: IScreen[] = []
  public stackedWidget: QStackedWidget = new QStackedWidget()

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
    this.stackedWidget.setCurrentIndex(this.screenStack.length - 1)
    win.setStyleSheet(screen.screenStyleSheet)
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
      win.setStyleSheet(this.screenStack[idx].screenStyleSheet)
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
}

export const navigation = Navigation.getInstance()

export function initWindow(
  screen: IScreen
): void {
  win.setWindowTitle("Quiz Game");

  navigation.goTo(screen, null)

  win.setCentralWidget(navigation.stackedWidget);
  win.setStyleSheet(screen.screenStyleSheet);
  win.show();

  (global as any).win = win;
}