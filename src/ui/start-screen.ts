import { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QListWidget, QTextEdit, QTextEditLineWrapMode, QListWidgetItem, QScreen } from '@nodegui/nodegui';
import MiniSignal from 'mini-signals';
import { ViewModel } from '../viewmodel';
import { IScreen } from './iscreen';

const vm = ViewModel.getInstance()

export class StartScreen implements IScreen {
    public centralWidget = new QWidget();
    public screenStyleSheet = 
    `
    #myroot {
      width: 720px;
      height: 640px;
      background-color: #fff;
      align-items: 'center';
      justify-content: 'center';
    }
    #mylabel {
      font-size: 16px;
      font-weight: bold;
      padding: 1;
    }
    #servername {
      height: 48px; 
    }
  `

    public constructor(
        listSignal: MiniSignal,
        onServerStart: (name: String) => any,
    ) {
        this.centralWidget.setObjectName("myroot");
      
        const rootLayout = new FlexLayout();
        this.centralWidget.setLayout(rootLayout);
        
        const label = new QLabel();
        label.setObjectName("mylabel");
        label.setText("Hello");
        
        const clientButton = new QPushButton();
        clientButton.setText("Client Start");
      
        const serverName = new QTextEdit();
        serverName.setObjectName("servername");
        serverName.setPlaceholderText("Server Name");
        serverName.setAcceptRichText(false);
        serverName.setLineWrapMode(QTextEditLineWrapMode.NoWrap);
      
        const serverList = new QListWidget();
        serverList.setObjectName("serverlist")
        listSignal.add(() => {
          onListSignal(serverList)
        })
        
        const serverButton = new QPushButton();
        serverButton.setText("Server Start");
        serverButton.addEventListener('clicked', (_) => {
          var name = serverName.toPlainText();
          if (name.length != 0) onServerStart(name);
        })
        
        const label2 = new QLabel();
        label2.setText("World");
        label2.setInlineStyle(`
          color: red;
        `);
        
        rootLayout.addWidget(label);
        rootLayout.addWidget(serverList);
        rootLayout.addWidget(clientButton);
        rootLayout.addWidget(serverName);
        rootLayout.addWidget(serverButton);
        rootLayout.addWidget(label2);
    }
}

function onListSignal(widget: QListWidget) {
  widget.items.forEach(witem => {
    if (!vm.qServerItems.has(witem as QListWidgetItem)) widget.removeItemWidget(witem as QListWidgetItem)
  })
  vm.qServerItems.forEach(qitem => {
    if (!widget.items.has(qitem)) widget.addItem(qitem)
  })
  console.log("ListSignal - ", widget.items.size, ", ", vm.qServerItems.size)
  widget.repaint()
}