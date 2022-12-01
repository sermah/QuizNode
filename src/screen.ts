import { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QListWidget, QTextEdit, QTextEditLineWrapMode, QListWidgetItem, QScreen } from '@nodegui/nodegui';
import MiniSignal from 'mini-signals';
import { IScreen } from './ui/iscreen';
import { ViewModel } from './viewmodel';

const vm = ViewModel.getInstance()

export function initWindow(
  screen: IScreen
): void {
  const win = new QMainWindow();
  win.setWindowTitle("Quiz Game");

  win.setCentralWidget(screen.centralWidget);
  win.setStyleSheet(screen.screenStyleSheet);
  win.show();
  
  (global as any).win = win;  
}

