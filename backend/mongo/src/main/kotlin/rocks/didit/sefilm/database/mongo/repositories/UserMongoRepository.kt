package rocks.didit.sefilm.database.mongo.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.mongo.entities.User
import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.GoogleId
import java.util.*

@Repository
@Deprecated(message = "")
internal interface UserMongoRepository : CrudRepository<User, GoogleId> {
  fun findByFilmstadenMembershipId(filmstadenMembershipId: FilmstadenMembershipId): User?
  fun findByCalendarFeedId(calendarFeedId: UUID): User?
  fun existsByForetagsbiljetterNumber(biljett: TicketNumber): Boolean
}
