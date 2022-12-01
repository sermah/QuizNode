import { ViewMode, QListWidgetItem } from "@nodegui/nodegui";
import MiniSignal from "mini-signals";

export class ViewModel {
    servers: any[] = []
    static instance: ViewModel;
    
    public listSignal = new MiniSignal()

    qServerItems: Set<QListWidgetItem> = new Set<QListWidgetItem>()

    public addServer(server: any) {
        this.servers.push(server)
        var qitem = new QListWidgetItem()
        qitem.setText(server.name)
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
        if (this.instance == null) 
            this.instance = new ViewModel()
        return this.instance
    } 
}

