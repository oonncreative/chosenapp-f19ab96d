package com.oonn.chosen.widget

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.LocalSize
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxHeight
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.layout.width
import androidx.glance.state.GlanceStateDefinition
import androidx.glance.state.PreferencesGlanceStateDefinition
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.Color
import com.oonn.chosen.R
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

@Serializable
data class ChosenMessage(val texto: String, val referencia: String, val resumo: String? = null)

@Serializable
data class ChosenMessagesResponse(val mensagens: List<ChosenMessage>)

val KEY_BACKGROUND = stringPreferencesKey("chosen_widget_background")
val KEY_CONTENT_TYPE = stringPreferencesKey("chosen_widget_content_type")
val KEY_MOSTRAR_MASCOTE = booleanPreferencesKey("chosen_widget_mostrar_mascote")

class ChosenWidget : GlanceAppWidget() {

    override val stateDefinition: GlanceStateDefinition<*> = PreferencesGlanceStateDefinition

    // Exact: o conteúdo conhece o tamanho real do widget (para dimensionar o mascote e o texto).
    override val sizeMode: SizeMode = SizeMode.Exact

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        android.util.Log.d("ChosenWidget", "provideGlance chamado para id=$id")
        val prefs = androidx.glance.appwidget.state.getAppWidgetState(context, PreferencesGlanceStateDefinition, id)
        val background = prefs[KEY_BACKGROUND] ?: "padrao"
        val contentType = prefs[KEY_CONTENT_TYPE] ?: "misto"
        // Widgets já existentes (sem essa chave salva) passam a mostrar o mascote por padrão.
        val mostrarMascote = prefs[KEY_MOSTRAR_MASCOTE] ?: true
        android.util.Log.d("ChosenWidget", "Lido do estado: background=$background contentType=$contentType mostrarMascote=$mostrarMascote")

        val message = fetchMessage(contentType)
        android.util.Log.d("ChosenWidget", "Mensagem obtida: ${message.texto}")

        provideContent {
            WidgetContent(message = message, background = background, mostrarMascote = mostrarMascote)
        }
    }

    private suspend fun fetchMessage(contentType: String): ChosenMessage = withContext(Dispatchers.IO) {
        try {
            var urlString = "https://chosen.oonn.com.br/api/public/widget-messages"
            if (contentType != "misto") {
                urlString += "?tipo=$contentType"
            }
            val connection = URL(urlString).openConnection() as HttpURLConnection
            connection.connectTimeout = 8000
            connection.readTimeout = 8000
            val body = connection.inputStream.bufferedReader().use { it.readText() }
            val decoded = Json { ignoreUnknownKeys = true }.decodeFromString<ChosenMessagesResponse>(body)
            decoded.mensagens.firstOrNull() ?: fallbackMessage()
        } catch (e: Exception) {
            android.util.Log.e("ChosenWidget", "Erro ao buscar mensagem", e)
            fallbackMessage()
        }
    }

    private fun fallbackMessage() = ChosenMessage(
        texto = "Uma palavra para agora.",
        referencia = "CHOSEN"
    )
}

/**
 * Tamanho de letra (sp) para o texto caber inteiro na área disponível, sem cortar.
 * Estimativa conservadora: cada caractere ocupa cerca de 0,9 * tamanho² de área.
 */
private fun fonteIdeal(texto: String, larguraDp: Float, alturaDp: Float, base: Float): Float {
    if (larguraDp <= 0f || alturaDp <= 0f) return 8f
    val n = texto.length.coerceAtLeast(1)
    val ideal = kotlin.math.sqrt((larguraDp * alturaDp) / (n * 0.75f)) * 0.9f
    return ideal.coerceIn(8f, base)
}

@androidx.compose.runtime.Composable
private fun WidgetContent(message: ChosenMessage, background: String, mostrarMascote: Boolean) {
    val bgColor = when (background) {
        "amarelo" -> Color(0xFFF7EE6B)
        "branco" -> Color(0xFFFFFFFF)
        else -> Color(0xFFF2F2F2)
    }
    val textColor = when (background) {
        "amarelo", "branco" -> Color(0xFF000000)
        else -> Color(0xFF1A1A1A)
    }

    val size = LocalSize.current
    val larguraInterna = size.width.value - 32f
    val alturaTexto = size.height.value - 32f - 20f // 20dp reservados para a referência

    // Mascote proporcional ao menor lado do widget, entre 44dp e 104dp.
    val lado = (minOf(size.width.value, size.height.value) * 0.5f).coerceIn(44f, 104f)

    // O texto nunca é cortado: a letra se ajusta ao espaço.
    // Se com o mascote a letra ficar pequena demais (< 11sp), o mascote some neste tamanho.
    val fonteComMascote = fonteIdeal(message.texto, larguraInterna - lado - 8f, alturaTexto, 15f)
    val mascoteVisivel = mostrarMascote && fonteComMascote >= 11f
    val fonte = if (mascoteVisivel) fonteComMascote
                else fonteIdeal(message.texto, larguraInterna, alturaTexto, 15f)

    Row(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(bgColor)
            .padding(16.dp),
        verticalAlignment = Alignment.Bottom
    ) {
        Column(modifier = GlanceModifier.defaultWeight().fillMaxHeight()) {
            Text(
                text = message.texto,
                style = TextStyle(fontSize = fonte.sp, fontWeight = FontWeight.Medium, color = ColorProvider(textColor))
            )
            Spacer(modifier = GlanceModifier.defaultWeight())
            Text(
                text = message.referencia,
                style = TextStyle(fontSize = 12.sp, color = ColorProvider(textColor))
            )
        }
        if (mascoteVisivel) {
            Spacer(modifier = GlanceModifier.width(8.dp))
            Image(
                provider = ImageProvider(R.drawable.widget_mascote),
                contentDescription = null,
                modifier = GlanceModifier.size(lado.dp)
            )
        }
    }
}

class ChosenWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = ChosenWidget()
}
