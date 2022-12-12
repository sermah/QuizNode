import { QListWidgetItem, ItemDataRole, QVariant, QListWidget } from "@nodegui/nodegui";
import Bonjour, { Browser, Service } from "bonjour-service";
import MiniSignal from "mini-signals";
import { Client } from "./client";
import { IMessage } from "./messages/imessage";
import { navigation } from "./navigation";
import { Server } from "./server";
import { CreateServerScreen } from "./ui/create-server-screen";
import { IScreen, ScreenType } from "./ui/iscreen";
import { StartScreen } from "./ui/start-screen";
import { HelloMessage } from "./messages/hello-message";
import { AnswerMessage } from "./messages/answer-message";
import { ServerScreen } from "./ui/server-screen";
import { PlayersMessage } from "./messages/players-message";
import { WaitingScreen } from "./ui/waiting-screen";
import { Connection } from "./connection";


class ViewModel {
  private static instance: ViewModel

  public bonjour = new Bonjour()
  public server = new Server(this.bonjour, 12)
  public client = new Client()
  public browser: Browser | undefined

  // Lobby
  public serverListSignal = new MiniSignal()
  private servers: any[] = []
  private qServerItems: Set<QListWidgetItem> = new Set<QListWidgetItem>()

  // Server control panel and waiting screen
  public playerListSignal = new MiniSignal()
  private qPlayerItems: Set<QListWidgetItem> = new Set<QListWidgetItem>()
  private players: any[] = []

  // General
  onClientConnect: () => void = () => { }
  onClientDisconnect: () => void = () => { }

  constructor() {
    this.client.onConnect = () => {
      console.log("Connected");
    }

    this.client.onDisconnect = () => {
      navigation.goBackUntil(ScreenType.StartScreen)
    }

    this.server.onMessage = (msg, conn) => this.serverOnMessage(msg, conn)
    this.client.onMessage = (msg) => this.clientOnMessage(msg)
  }

  public browseServers() {
    this.browser = this.bonjour.find({ type: 'quiz' })

    this.browser.on("up", function (service: any) {
      console.log('Found an _quiz._tcp server:', service.name)
      viewModel.updateServices()
      viewModel.printServers()
    })

    this.browser.on("down", function (service: any) {
      console.log('Server down:', service.name)
      // console.log('Data:\n', service)
      viewModel.updateServices()
      viewModel.printServers()
    })
  }

  public createServer(name: string) {
    var goodName = name.replace(/' '/g, ' ').trim();
    this.server.start(goodName)
    navigation.goTo(this.makeServerScreen(name), null)
  }

  public async updatePlayers() {
    this.qPlayerItems.clear()

    for (const pl of this.players) {
      var qitem = new QListWidgetItem()
      qitem.setText(pl)
      qitem.setData(ItemDataRole.UserRole, new QVariant(JSON.stringify(pl)))
      this.qPlayerItems.add(qitem)
    }

    this.playerListSignal.dispatch()
  }

  public async updateServices() {
    var services = this.browser?.services

    if (services) {
      this.qServerItems.clear()

      for (const sv of services) {
        var qitem = new QListWidgetItem()
        qitem.setText(sv.name)
        qitem.setData(ItemDataRole.UserRole, new QVariant(JSON.stringify(sv)))
        this.qServerItems.add(qitem)
      }

      this.serverListSignal.dispatch()
    }
  }

  public printServers() {
    console.log("Current servers:")
    this.servers.forEach(srv => {
      console.log(" - ", srv.name)
    })
  }

  public static getInstance(): ViewModel {
    if (!ViewModel.instance)
      ViewModel.instance = new ViewModel()
    return ViewModel.instance
  }

  public makeStartScreen(): StartScreen {
    return new StartScreen(
      (list) => {
        this.serverListSignal.add(() => {
          this.onListSignal(list, this.qServerItems)
        })
      },
      () => this.visitCreateServerScreen(),
      (serviceData) => {
        this.client.connect(serviceData, "Player")
        navigation.goTo(this.makeWaitingScreen(
          (serviceData as Service).name,
        ), null)
      }
    )
  }

  private makeCreateServerScreen(): CreateServerScreen {
    return new CreateServerScreen(
      (name) => this.createServer(name),
      () => {
        this.returnBack()
      }
    )
  }

  private makeServerScreen(title: string): ServerScreen {
    return new ServerScreen(
      title,
      (list) =>
        this.playerListSignal.add(() => {
          this.onListSignal(list, this.qPlayerItems)
        }),
      (bind) =>
        this.playerListSignal.detach(bind),
      () => {
        console.log("Start")
      },
      () => {
        this.server.stop()
        this.returnBack()
      }
    )
  }

  private makeWaitingScreen(title: string): WaitingScreen {
    return new WaitingScreen(
      title,
      (list) =>
        this.playerListSignal.add(() => {
          this.onListSignal(list, this.qPlayerItems)
        }),
      (bind) =>
        this.playerListSignal.detach(bind),
      () => {
        this.client.disconnect()
        this.returnBack()
      }
    )
  }

  public visitNewScreen(scr: IScreen, data: any) {
    navigation.goTo(scr, data)
  }

  public returnToStartScreen(): void {
    navigation.goBackUntil(ScreenType.StartScreen)
  }

  public visitCreateServerScreen(): void {
    this.visitNewScreen(
      this.makeCreateServerScreen(),
      null
    )
  }

  public returnBack(): void {
    navigation.goBack()
  }

  public onListSignal(widget: QListWidget, list: Set<QListWidgetItem>) {
    var toRemove: QListWidgetItem[] = []
    for (const wic of widget.items) {
      var wi = wic as QListWidgetItem
      if (!list.has(wi)) {
        console.log("Deleting item '", wi.text(), "'")
        toRemove.push(wi)
      }
    }
    for (const ri of toRemove) {
      widget.takeItem(widget.row(ri))
      widget.items.delete(ri)
    }
    for (const qi of list) {
      if (!widget.items.has(qi))
        widget.addItem(qi)
    }
    console.log("ListSignal - ", widget.items.size, ", ", list.size)
    widget.repaint()
  }

  serverOnMessage(msg: IMessage, conn: Connection) {
    switch (msg.messageType) {
      case "hello": {
        this.server.addNewName(conn, (msg as HelloMessage).name ?? "Unknown",
          () => {
            this.players = Array.from(this.server.namesByID.values())
            this.updatePlayers()
          }
        )
        break
      }
      case "answer": {
        this.server.addAnswer(conn.id, (msg as AnswerMessage).answer ? 1 : 0)
        break
      }
    }
  }

  clientOnMessage(msg: IMessage) {
    switch (msg.messageType) {
      case "players": {
        this.players = (msg as PlayersMessage).playersName
        this.updatePlayers()
        break
      }
      case "question": {
        break
      }
      case "results": {
        break
      }
      case "accessDenied": {
        break
      }
    }
  }
}

export const viewModel = ViewModel.getInstance()
