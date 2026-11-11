import WidgetKit
import SwiftUI

struct ChosenMessage: Codable {
    let texto: String
    let referencia: String
    let resumo: String?
}

struct ChosenMessagesResponse: Codable {
    let mensagens: [ChosenMessage]
}

struct ChosenEntry: TimelineEntry {
    let date: Date
    let texto: String
    let referencia: String
    let resumo: String?
    let background: ChosenWidgetBackground
    let mostrarMascote: Bool
}

struct ChosenProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> ChosenEntry {
        ChosenEntry(date: Date(), texto: "Uma palavra para agora.", referencia: "CHOSEN", resumo: nil, background: .padrao, mostrarMascote: true)
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> ChosenEntry {
        ChosenEntry(date: Date(), texto: "Uma palavra para agora.", referencia: "CHOSEN", resumo: nil, background: configuration.background, mostrarMascote: configuration.mostrarMascote)
    }

    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<ChosenEntry> {
        let messages = await fetchMessages(tipo: configuration.contentType)
        let now = Date()
        var entries: [ChosenEntry] = []

        if messages.isEmpty {
            entries.append(ChosenEntry(date: now, texto: "Uma palavra para agora.", referencia: "CHOSEN", resumo: nil, background: configuration.background, mostrarMascote: configuration.mostrarMascote))
        } else {
            for (index, message) in messages.enumerated() {
                let entryDate = Calendar.current.date(byAdding: .hour, value: index * 4, to: now) ?? now
                entries.append(ChosenEntry(date: entryDate, texto: message.texto, referencia: message.referencia, resumo: message.resumo, background: configuration.background, mostrarMascote: configuration.mostrarMascote))
            }
        }

        let nextRefresh = Calendar.current.date(byAdding: .hour, value: 1, to: now) ?? now
        return Timeline(entries: entries, policy: .after(nextRefresh))
    }

    private func fetchMessages(tipo: ChosenWidgetContentType) async -> [ChosenMessage] {
        var urlString = "https://chosen.oonn.com.br/api/public/widget-messages"
        if tipo != .misto {
            urlString += "?tipo=\(tipo.rawValue)"
        }
        guard let url = URL(string: urlString) else {
            return []
        }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let decoded = try JSONDecoder().decode(ChosenMessagesResponse.self, from: data)
            return decoded.mensagens
        } catch {
            return []
        }
    }
}

struct ChosenWidgetEntryView: View {
    var entry: ChosenProvider.Entry
    @Environment(\.widgetFamily) var family

    private var backgroundColor: Color {
        switch entry.background {
        case .padrao: return Color(.systemGray6)
        case .amarelo: return Color(red: 0.97, green: 0.93, blue: 0.42)
        case .branco: return .white
        }
    }

    private var textColor: Color {
        switch entry.background {
        case .padrao: return .primary
        case .amarelo, .branco: return .black
        }
    }

    /// Resumo (reflexão), quando existe. Aparece inteiro no widget grande.
    private var resumoTexto: String? {
        guard let resumo = entry.resumo, !resumo.isEmpty else { return nil }
        return resumo
    }

    private func referenciaView(_ tamanho: CGFloat) -> some View {
        Text(entry.referencia)
            .font(.system(size: tamanho))
            .foregroundStyle(textColor.opacity(0.7))
            .lineLimit(1)
            .minimumScaleFactor(0.8)
    }

    private func mascote(_ lado: CGFloat) -> some View {
        Image("WidgetMascote")
            .resizable()
            .widgetAccentedRenderingMode(.fullColor)
            .scaledToFit()
            .frame(width: lado, height: lado)
            .accessibilityHidden(true)
    }

    var body: some View {
        content
            .containerBackground(backgroundColor, for: .widget)
    }

    @ViewBuilder
    private var content: some View {
        switch family {
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.texto)
                    .font(.system(size: 13, weight: .medium))
                    .minimumScaleFactor(0.7)
                    .lineLimit(4)
                Text(entry.referencia)
                    .font(.system(size: 11))
                    .opacity(0.7)
            }
        case .accessoryInline:
            Text(entry.texto)
        case .accessoryCircular:
            VStack {
                Image(systemName: "book.fill")
                Text(entry.referencia)
                    .font(.system(size: 9))
            }
        case .systemSmall:
            smallLayout
        case .systemMedium:
            mediumLayout
        case .systemLarge:
            largeLayout
        default:
            EmptyView()
        }
    }

    // MARK: - Pequeno
    // O texto nunca é cortado: se não couber, a letra diminui.
    // O mascote só aparece quando o texto é curto (até 60 caracteres),
    // para não tirar espaço do texto.
    private var smallLayout: some View {
        let comMascote = entry.mostrarMascote && entry.texto.count <= 60
        return ZStack(alignment: .bottomTrailing) {
            VStack(alignment: .leading, spacing: 4) {
                Text(entry.texto)
                    .font(.system(size: comMascote ? 13 : 14, weight: .medium))
                    .foregroundStyle(textColor)
                    .minimumScaleFactor(comMascote ? 0.8 : 0.55)
                    .frame(maxWidth: .infinity, maxHeight: comMascote ? 56 : CGFloat.infinity, alignment: .topLeading)
                referenciaView(11)
                if comMascote {
                    Spacer(minLength: 0)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)

            if comMascote {
                mascote(48)
            }
        }
    }

    // MARK: - Médio
    // Texto à esquerda (diminui a letra se for longo), mascote à direita.
    private var mediumLayout: some View {
        HStack(alignment: .bottom, spacing: 8) {
            VStack(alignment: .leading, spacing: 4) {
                Text(entry.texto)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(textColor)
                    .minimumScaleFactor(0.55)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                referenciaView(12)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)

            if entry.mostrarMascote {
                mascote(104)
            }
        }
    }

    // MARK: - Grande
    // Título e mascote no topo; o resumo ocupa o resto, inteiro (a letra se ajusta).
    private var largeLayout: some View {
        let temResumo = resumoTexto != nil
        return VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .top, spacing: 8) {
                Text(entry.texto)
                    .font(.system(size: temResumo ? 17 : 22, weight: .medium))
                    .foregroundStyle(textColor)
                    .minimumScaleFactor(0.6)
                    .frame(maxWidth: .infinity, maxHeight: temResumo ? 96 : 200, alignment: .topLeading)

                if entry.mostrarMascote {
                    mascote(72)
                }
            }

            if let resumoCompleto = resumoTexto {
                Text(resumoCompleto)
                    .font(.system(size: 12))
                    .foregroundStyle(textColor.opacity(0.85))
                    .minimumScaleFactor(0.55)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            } else {
                Spacer(minLength: 0)
            }

            referenciaView(12)
        }
    }
}

struct ChosenWidget: Widget {
    let kind: String = "ChosenWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: ChosenProvider()) { entry in
            ChosenWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("CHOSEN")
        .description("Uma palavra bíblica para o seu dia.")
        .supportedFamilies([.accessoryRectangular, .accessoryCircular, .accessoryInline, .systemSmall, .systemMedium, .systemLarge])
    }
}
