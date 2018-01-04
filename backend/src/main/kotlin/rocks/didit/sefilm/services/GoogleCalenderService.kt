package rocks.didit.sefilm.services

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType.APPLICATION_JSON_UTF8
import org.springframework.security.oauth2.common.OAuth2AccessToken
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import rocks.didit.sefilm.domain.dto.CalendarEventDTO
import rocks.didit.sefilm.oauthAccessToken

@Component
class GoogleCalenderService(
  private val restTemplate: RestTemplate) {

  companion object {
    private const val API_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    private val log: Logger = LoggerFactory.getLogger(GoogleCalenderService::class.java)
  }

  @Value("\${google.clientSecret}")
  private val clientSecret: String? = null

  /** @return the event id of the newly created event */
  fun createEvent(event: CalendarEventDTO): String {
    val accessToken = oauthAccessToken()

    val entity = HttpEntity(event, headersWithToken(accessToken))

    val resultBody: Map<String, Any?>? = restTemplate
      .exchange(API_URL,
        HttpMethod.POST,
        entity,
        object : ParameterizedTypeReference<Map<String, Any?>>() {},
        mapOf("sendNotifications" to "true", "key" to clientSecret))
      .body

    return resultBody?.get("id")?.toString() ?: ""
  }

  fun deleteEvent(eventId: String) {
    val accessToken = oauthAccessToken()
    val headers = headersWithToken(accessToken)
    val entity = HttpEntity<Void>(headers)

    try {
      log.info("Removing calendar event with id: $eventId")
      restTemplate.exchange("https://www.googleapis.com/calendar/v3/calendars/primary/events/{eventId}", HttpMethod.DELETE, entity, Void::class.java, eventId)
    } catch (e: Exception) {
      log.warn("Unable to delete calendar event with ID: $eventId", e)
    }
  }

  private fun headersWithToken(accessToken: OAuth2AccessToken): HttpHeaders {
    val headers = HttpHeaders()
    headers.contentType = APPLICATION_JSON_UTF8
    headers.set("authorization", accessToken.tokenType + " " + accessToken.value)
    return headers
  }
}


