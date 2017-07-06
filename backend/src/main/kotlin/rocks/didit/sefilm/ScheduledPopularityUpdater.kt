package rocks.didit.sefilm

import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import rocks.didit.sefilm.clients.ImdbClient
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.repositories.MovieRepository
import java.time.Instant
import java.util.*

@Component
class ScheduledPopularityUpdater(private val movieRepository: MovieRepository,
                                 private val imdbClient: ImdbClient) {

  companion object {
    private const val INITIAL_UPDATE_DELAY = 10L * 60 * 1000L // 10min
    private const val UPDATE_INTERVAL = 4 * 60 * 60 * 1000L // 4 hours
  }

  private val log = LoggerFactory.getLogger(ScheduledPopularityUpdater::class.java)

  @Scheduled(initialDelay = INITIAL_UPDATE_DELAY, fixedDelay = UPDATE_INTERVAL)
  fun scheduledMovieUpdates() {
    val moviesWithOldPopularity = movieRepository
      .findAll()
      .filter(Movie::isPopularityOutdated)
    if (moviesWithOldPopularity.isNotEmpty()) {
      log.info("[Schedule] Updating popularity for ${moviesWithOldPopularity.count()} movies")
      updatePopularitys(moviesWithOldPopularity)
    }
  }

  fun updatePopularitys(movies: Iterable<Movie>) {
    movies.forEach {
      log.info("[Popularity] Updating popularity for '${it.title}' with id=${it.id}")
      try {
        updatePopularity(it)
      } catch(e: Exception) {
        log.warn("[Popularity] An error occurred when updating popularity for '${it.title}' ID=${it.id}", e)
      }
      randomBackoff()
    }
  }

  private fun randomBackoff() {
    val waitTime = 3000L + Random().nextInt(10000)
    try {
      Thread.sleep(waitTime)
    } catch(e: InterruptedException) {
      log.info("[Popularity] randomBackoff were interrupted")
      Thread.currentThread().interrupt()
    }
  }

  private fun updatePopularity(movie: Movie) {
    val popularityAndId = when {
      movie.tmdbId != null -> fetchPopularityByTmdbId(movie)
      movie.imdbId != null -> fetchPopularityByImdbId(movie)
      else -> fetchPopularityByTitle(movie)
    }

    if (popularityAndId == null) {
      log.warn("[Popularity] No info found for movie with ID=${movie.id}")
      return
    }

    val updatedMovie = movie.copy(
      popularity = popularityAndId.popularity,
      popularityLastUpdated = Instant.now(),
      tmdbId = popularityAndId.tmdbId,
      imdbId = popularityAndId.imdbId
    )
    log.info("[Popularity] Popularity updated from ${movie.popularity} → ${updatedMovie.popularity} for '${movie.title}'")
    movieRepository.save(updatedMovie)
  }

  private fun fetchPopularityByTmdbId(movie: Movie): PopularityAndId? {
    if (movie.tmdbId == null) {
      log.warn("[TMDb][Popularity] Movie[${movie.id} is missing an TMDb id")
      return null
    }

    val movieDetails = imdbClient.movieDetailsExact(movie.tmdbId)
    return PopularityAndId(movieDetails.popularity, movieDetails.id, movieDetails.imdb_id)
  }

  private fun fetchPopularityByImdbId(movie: Movie): PopularityAndId? {
    if (movie.imdbId == null) {
      log.warn("[IMDb][Popularity] Movie[${movie.id} is missing an IMDb id")
      return null
    }

    val movieDetails = imdbClient.movieDetails(movie.imdbId)
    return PopularityAndId(movieDetails.popularity, movieDetails.id, movieDetails.imdb_id)
  }

  private fun fetchPopularityByTitle(movie: Movie): PopularityAndId? {
    val title = movie.originalTitle ?: movie.title
    val movieResults = imdbClient.search(title)

    if (movieResults.isEmpty()) return null

    val movieDetails = imdbClient.movieDetails(movieResults[0].id)
    return PopularityAndId(movieDetails.popularity, movieDetails.id, movieDetails.imdb_id)
  }

  private data class PopularityAndId(val popularity: Double, val tmdbId: Long, val imdbId: String = "N/A")
}