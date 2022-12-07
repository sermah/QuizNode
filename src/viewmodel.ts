import { QListWidgetItem, ItemDataRole, QVariant, QListWidget } from "@nodegui/nodegui";
import Bonjour, { Browser } from "bonjour-service";
import MiniSignal from "mini-signals";
import { navigation } from "./navigation";
import { Server } from "./server";
import { CreateServerScreen } from "./ui/create-server-screen";
import { IScreen, ScreenType } from "./ui/iscreen";
import { StartScreen } from "./ui/start-screen";


class ViewModel {
    private static instance: ViewModel

    public listSignal = new MiniSignal()
    public bonjour = new Bonjour()
    public server = new Server(this.bonjour)
    public browser: Browser | undefined

    private servers: any[] = []
    private qServerItems: Set<QListWidgetItem> = new Set<QListWidgetItem>()

    public browseServers() {
        // browse for all http services
        this.browser = this.bonjour.find({ type: '_quiz._tcp' })

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
        var goodName = name.replace(/' '/g, ' ');
        this.server.start(goodName)
    }

    public addServer(server: any) {
        this.servers.push(server)
        var qitem = new QListWidgetItem()
        qitem.setText(server.name)
        qitem.setData(ItemDataRole.UserRole, new QVariant(JSON.stringify(server)))
        this.qServerItems.add(qitem)
        this.listSignal.dispatch()
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

            this.listSignal.dispatch()
        }
    }

    public removeServer(server: any) {
        var idx = this.servers.indexOf(server)
        if (idx > -1) this.servers.splice(idx, 1)
        for (const qitem of this.qServerItems) {
            var item = JSON.parse(qitem.data(ItemDataRole.UserRole).toString())
            if (item.name == server.name)
                this.qServerItems.delete(item)
        }
        this.listSignal.dispatch()
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
                this.listSignal.add(() => {
                    this.onServerListSignal(list)
                })
            },
            () => this.visitCreateServerScreen(),
            () => { }
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
}

export const viewModel = ViewModel.getInstance()
