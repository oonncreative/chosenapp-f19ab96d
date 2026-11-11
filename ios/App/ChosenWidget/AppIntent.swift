import WidgetKit
import AppIntents

enum ChosenWidgetBackground: String, AppEnum {
    case padrao
    case amarelo
    case branco

    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Fundo do Widget"

    static var caseDisplayRepresentations: [ChosenWidgetBackground: DisplayRepresentation] = [
        .padrao: "Padrão",
        .amarelo: "Amarelo",
        .branco: "Branco"
    ]
}

enum ChosenWidgetContentType: String, AppEnum {
    case misto
    case versiculo
    case oracao
    case motivacional

    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Tipo de Conteúdo"

    static var caseDisplayRepresentations: [ChosenWidgetContentType: DisplayRepresentation] = [
        .misto: "Misto",
        .versiculo: "Versículos",
        .oracao: "Orações",
        .motivacional: "Motivacional"
    ]
}

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "CHOSEN"
    static var description = IntentDescription("Escolha o visual e o conteúdo do widget CHOSEN.")

    @Parameter(title: "Fundo", default: .padrao)
    var background: ChosenWidgetBackground

    @Parameter(title: "Conteúdo", default: .misto)
    var contentType: ChosenWidgetContentType

    @Parameter(title: "Mostrar mascote", default: true)
    var mostrarMascote: Bool
}
