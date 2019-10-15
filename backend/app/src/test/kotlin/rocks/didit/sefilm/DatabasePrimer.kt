package rocks.didit.sefilm

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.springframework.stereotype.Component
import rocks.didit.sefilm.domain.dto.core.MovieDTO
import rocks.didit.sefilm.domain.dto.core.ParticipantDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.domain.dto.core.UserDTO
import java.util.*
import java.util.concurrent.ThreadLocalRandom

@Component
class DatabasePrimer(private val jdbi: Jdbi) {
  fun doDbTest(init: DbTest.() -> Unit): DbTest {
    val dbTest = DbTest(jdbi)
    dbTest.init()
    return dbTest
  }
}

class DbTest(private val jdbi: Jdbi) {
  private var testData: TestData = TestData()

  fun withUser(init: TestData.(ThreadLocalRandom) -> UserDTO) {
    testData = testData.addUser(testData.init(ThreadLocalRandom.current()))
  }

  fun withUser(userId: UUID = UUID.randomUUID()) {
    testData = testData.addUser(ThreadLocalRandom.current().nextUserDTO(userId))
  }

  fun withMovie(init: TestData.(ThreadLocalRandom) -> MovieDTO) {
    testData = testData.addMovie(testData.init(ThreadLocalRandom.current()))
  }

  fun withMovie() {
    testData = testData.addMovie(ThreadLocalRandom.current().nextMovie())
  }

  fun withShowing(init: TestData.(ThreadLocalRandom) -> ShowingDTO) {
    testData = testData.addShowing(testData.init(ThreadLocalRandom.current()))
  }

  fun withShowings(init: TestData.(ThreadLocalRandom) -> List<ShowingDTO>) {
    testData = testData.addShowings(testData.init(ThreadLocalRandom.current()))
  }

  fun withShowing() {
    if (testData.lastUser == null) {
      withUser()
    }
    if (testData.lastMovie == null) {
      withMovie()
    }
    withShowing { it.nextShowing(testData.lastMovie?.id!!, testData.lastUser?.id!!) }
  }

  fun withParticipant(init: TestData.(ThreadLocalRandom) -> ParticipantDTO) {
    testData = testData.addParticipant(testData.init(ThreadLocalRandom.current()))
  }

  fun withParticipantOnLastShowing() {
    requireNotNull(testData.lastShowing)
    withUser()
    withParticipant {
      it.nextParticipant(testData.lastUser?.id!!, testData.lastShowing?.id!!)
    }
  }

  fun afterInsert(init: TestData.(Daos) -> Unit) {
    insertNotNullFields()
    jdbi.useTransactionUnchecked { handle ->
      testData.init(handle.toDaos())
    }
  }

  private fun insertNotNullFields() {
    return jdbi.useTransactionUnchecked { handle ->
      val daos = handle.toDaos()

      testData.users.forEach {
        daos.userDao.insertUserAndGiftCerts(it.value)
      }
      if (testData.movies.isNotEmpty()) {
        daos.movieDao.insertMovies(testData.movies.values)
      }
      testData.showings.forEach {
        if (it.value.location != null) {
          daos.locationDao.insertLocationAndAlias(it.value.location!!)
        }
        daos.showingDao.insertShowingAndCinemaScreen(it.value)
      }

      if (testData.participants.isNotEmpty()) {
        daos.participantDao.insertParticipantsOnShowing(testData.participants)
      }
    }
  }
}

data class TestData(
  val users: Map<UUID, UserDTO> = mapOf(),
  val lastUser: UserDTO? = null,

  val movies: Map<UUID, MovieDTO> = mapOf(),
  val lastMovie: MovieDTO? = null,

  val showings: Map<UUID, ShowingDTO> = mapOf(),
  val lastShowing: ShowingDTO? = null,

  val participants: List<ParticipantDTO> = listOf(),
  val lastParticipant: ParticipantDTO? = null
) {
  val user: UserDTO get() = lastUser ?: throw IllegalStateException()
  val movie: MovieDTO get() = lastMovie ?: throw IllegalStateException()
  val showing: ShowingDTO get() = lastShowing ?: throw IllegalStateException()
  val participant: ParticipantDTO get() = lastParticipant ?: throw IllegalStateException()

  fun addUser(user: UserDTO): TestData = copy(lastUser = user, users = users.plus(Pair(user.id, user)))
  fun addMovie(movie: MovieDTO): TestData = copy(lastMovie = movie, movies = movies.plus(Pair(movie.id, movie)))
  fun addShowing(showing: ShowingDTO): TestData =
    copy(lastShowing = showing, showings = showings.plus(Pair(showing.id, showing)))

  fun addShowings(showings: List<ShowingDTO>): TestData =
    copy(lastShowing = showings.last(), showings = this.showings.plus(showings.map { Pair(it.id, it) }))

  fun addParticipant(participant: ParticipantDTO): TestData =
    copy(lastParticipant = participant, participants = participants.plus(participant))
}
