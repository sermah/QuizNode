import { QWidget } from "@nodegui/nodegui";

export interface IScreen {
    centralWidget: QWidget
    screenStyleSheet: string
}