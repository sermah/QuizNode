import { QWidget } from "@nodegui/nodegui";

export interface IScreen {
    type: ScreenType
    mainWidget: QWidget
    screenStyleSheet: string

    init(data: any): void
    deinit(): void
}

export enum ScreenType {
    StartScreen,
    CreateServerScreen,
    ServerScreen,
    WaitingScreen,
    ResultsScreen,
    QuestionScreen,
    QuizPickScreen
}