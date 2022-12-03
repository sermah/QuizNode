import { QListWidgetItem, ItemDataRole, QVariant, QListWidget } from "@nodegui/nodegui";
import MiniSignal from "mini-signals";
import { navigation } from "./screen";
import { startServer } from "./server";
import { CreateServerScreen } from "./ui/create-server-screen";
import { IScreen, ScreenType } from "./ui/iscreen";
import { StartScreen } from "./ui/start-screen";


class ViewModel {
    private static instance: ViewModel

    public listSignal = new MiniSignal()

    private servers: any[] = []
    private qServerItems: Set<QListWidgetItem> = new Set<QListWidgetItem>()

    public createServer(name: string) {
        var goodName = name.replace(/' '/g, ' ');
        startServer(goodName)
    }

    public addServer(server: any) {
        this.servers.push(server)
        var qitem = new QListWidgetItem()
        qitem.setText(server.name)
        qitem.setData(ItemDataRole.UserRole, new QVariant(JSON.stringify(server)))
        this.qServerItems.add(qitem)
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
            () => this.returnBack(),
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
        widget.items.forEach(witem => {
            if (!this.qServerItems.has(witem as QListWidgetItem))
                widget.removeItemWidget(witem as QListWidgetItem)
        })
        this.qServerItems.forEach(qitem => {
            if (!widget.items.has(qitem)) widget.addItem(qitem)
        })
        console.log("ListSignal - ", widget.items.size, ", ", this.qServerItems.size)
        widget.repaint()
    }
}

export const viewModel = ViewModel.getInstance()
