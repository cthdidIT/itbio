package rocks.didit.sefilm.services

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.repositories.MovieRepository
import java.util.*

@Component
class MovieService(
  private val movieRepo: MovieRepository) {

  private val log: Logger = LoggerFactory.getLogger(MovieService::class.java)

  /** All movies that aren't archived */
  fun allMovies() = movieRepo.findByArchivedOrderByPopularityDesc(false)
  fun archivedMovies() = movieRepo.findByArchivedOrderByPopularityDesc(true)
  fun getMovie(movieId: UUID): Optional<Movie> = movieRepo.findById(movieId)
}