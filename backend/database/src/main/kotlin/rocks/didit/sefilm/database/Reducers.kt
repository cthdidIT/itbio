package rocks.didit.sefilm.database

import org.jdbi.v3.core.result.LinkedHashMapRowReducer
import org.jdbi.v3.core.result.RowView
import rocks.didit.sefilm.domain.dto.FilmstadenLiteScreenDTO
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.core.LocationDTO
import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.domain.dto.core.UserDTO
import rocks.didit.sefilm.domain.id.ShowingID
import rocks.didit.sefilm.domain.id.UserID

class UserGiftCertReducer : LinkedHashMapRowReducer<UserID, UserDTO> {
  override fun accumulate(container: MutableMap<UserID, UserDTO>, rowView: RowView) {
    val id = rowView.getColumn("id", UserID::class.java)
    val user = container.computeIfAbsent(id) { rowView.getRow(UserDTO::class.java) }

    if (rowView.getColumn("user_id", UserID::class.java) != null) {
      val giftCert = rowView.getRow(GiftCertificateDTO::class.java)
      container.replace(id, user.copy(giftCertificates = user.giftCertificates.plus(giftCert)))
    }
  }
}

class LocationAliasReducer : LinkedHashMapRowReducer<String, LocationDTO> {
  override fun accumulate(container: MutableMap<String, LocationDTO>, rowView: RowView) {
    val id = rowView.getColumn("l_name", String::class.java)
    val location = container.computeIfAbsent(id) { rowView.getRow(LocationDTO::class.java) }

    val alias = rowView.getColumn("la_alias", String::class.java)
    if (alias != null) {
      container.replace(id, location.copy(alias = location.alias.plus(alias)))
    }
  }
}

class ShowingLocationScreenReducer : LinkedHashMapRowReducer<ShowingID, ShowingDTO> {
  override fun accumulate(container: MutableMap<ShowingID, ShowingDTO>, rowView: RowView) {
    val id = rowView.getColumn("id", ShowingID::class.java)
    var showing = container.computeIfAbsent(id) { rowView.getRow(ShowingDTO::class.java) }

    val cinemaScreenId = rowView.getColumn("cs_filmstadenId", String::class.java)
    if (cinemaScreenId != null && showing.cinemaScreen == null) {
      val cinemaScreen = rowView.getRow(FilmstadenLiteScreenDTO::class.java)

      showing = showing.copy(cinemaScreen = cinemaScreen)
      container.replace(id, showing)
    }

    val locationName = rowView.getColumn("l_name", String::class.java)
    if (locationName != null && showing.location == null) {
      val location = rowView.getRow(LocationDTO::class.java)

      showing = showing.copy(location = location)
      container.replace(id, showing)
    }

    val alias = rowView.getColumn("la_alias", String::class.java)
    if (alias != null && showing.location != null) {
      showing = showing.copy(
        location = showing.location!!.copy(alias = showing.location!!.alias.plus(alias))
      )
      container.replace(id, showing)
    }
  }
}

class ParticipantGiftCertReducer : LinkedHashMapRowReducer<Pair<UserID, ShowingID>, ParticipantDTO> {
  override fun accumulate(container: MutableMap<Pair<UserID, ShowingID>, ParticipantDTO>, rowView: RowView) {
    val userId = rowView.getColumn("user_id", UserID::class.java)
    val showingId = rowView.getColumn("showing_id", ShowingID::class.java)
    val pair = Pair(userId, showingId)
    val participant = container.computeIfAbsent(pair) {
      rowView.getRow(ParticipantDTO::class.java)
    }

    val gcUserId = rowView.getColumn("gc_userId", UserID::class.java)
    if (gcUserId != null) {
      val giftCert = rowView.getRow(GiftCertificateDTO::class.java)
      container.replace(pair, participant.copy(giftCertificateUsed = giftCert))
    }
  }
}
