import { QListWidgetItem, ItemDataRole, QVariant, QListWidget } from "@nodegui/nodegui";
import Bonjour, { Browser } from "bonjour-service";
import { on } from "events";
import { randomUUID } from "crypto"
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
    
    // Server control panel
    public playerListSignal = new MiniSignal()

    // General
    onClientConnect: () => void = () => {}
    onClientDisconnect: () => void = () => {}

    constructor() {
        this.client.onConnect = () => this.onClientConnect()
        this.client.onDisconnect = () => this.onClientDisconnect()

        this.onClientConnect = () => {
            console.log("Connected");
        }

        this.onClientDisconnect = () => {
            navigation.goBackUntil(ScreenType.StartScreen)
        }

        this.server.onMessage = (msg, id) => this.serverOnMessage(msg, id)
        this.client.onMessage = () => {}
    }

    public browseServers() {
        this.browser = this.bonjour.find({ type: 'quiz'})

        this.browser.on("up", function (service: any) {
            console.log('Found an _quiz._tcp server:', service.name)
            viewModel.updateServices()
            viewModel.printServers()
        })

        this.browser.on("down", function (service: any) {
            console.log('Unpublishing:', service.name)
            console.log('Data:\n', service)
            viewModel.updateServices()
            viewModel.printServers()
        })
    }

    public createServer(name: string) {
        var goodName = name.replace(/' '/g, ' ').trim();
        this.server.start(goodName)
    }

    public updateServerPlayers() {
        
    }

    public updateServices() {
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

    public defaultStartScreen(): StartScreen {
        return new StartScreen(
            (list) => {
                this.serverListSignal.add(() => {
                    this.onServerListSignal(list)
                })
            },
            () => this.visitCreateServerScreen(),
            (serviceData) => {
                this.client.connect(serviceData)
            }
        )
    }

    private defaultCreateServerScreen(): CreateServerScreen {
        return new CreateServerScreen(
            (name) => this.createServer(name),
            () => {
                this.server.stop()
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
            this.defaultCreateServerScreen(),
            null
        )
    }

    public returnBack(): void {
        navigation.goBack()
    }

    public onServerListSignal(widget: QListWidget) {
        var toRemove : QListWidgetItem[] = []
        for (const wic of widget.items) {
            var wi = wic as QListWidgetItem
            if (!this.qServerItems.has(wi)){
                console.log("Deleting item '", wi.text(), "'")
                toRemove.push(wi)
            }
        }
        for (const ri of toRemove) {
            widget.takeItem(widget.row(ri))
            widget.items.delete(ri)
        }
        for (const qi of this.qServerItems) {
            if (!widget.items.has(qi))
                widget.addItem(qi)
        }
        console.log("ListSignal - ", widget.items.size, ", ", this.qServerItems.size)
        widget.repaint()
    }

    serverOnMessage(msg: IMessage, id: string) {
        switch(msg.messageType) {
            case "hello": {
                this.server.addNewName(randomUUID(), (msg as HelloMessage).name ?? "Unknown")
                break
            }
            case "answer": {
                this.server.addAnswer(id, (msg as AnswerMessage).answer ? 1 : 0)
                break
            }
        }
    }
}

export const viewModel = ViewModel.getInstance()
