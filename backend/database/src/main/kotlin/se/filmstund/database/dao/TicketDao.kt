package se.filmstund.database.dao

import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.customizer.Timestamped
import org.jdbi.v3.sqlobject.statement.SqlBatch
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
import se.filmstund.domain.dto.core.TicketDTO
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.UserID

interface TicketDao {
  @SqlQuery("SELECT count(*) FROM ticket")
  fun count(): Int

  @SqlQuery("SELECT * FROM ticket WHERE id = :id")
  fun findById(id: String): TicketDTO

  @SqlQuery("SELECT exists(SELECT 1 FROM ticket WHERE id = :id)")
  fun existsById(id: String): Boolean

  @SqlQuery("SELECT * FROM ticket WHERE showing_id = :showingId")
  fun findByShowing(showingId: ShowingID): List<TicketDTO>

  @SqlQuery("SELECT * FROM ticket WHERE showing_id = :showingId AND assigned_to_user = :userId")
  fun findByUserAndShowing(userId: UserID, showingId: ShowingID): List<TicketDTO>

  @Timestamped
  @SqlUpdate("UPDATE ticket SET assigned_to_user = :newAssignee, last_modified_date = :now WHERE id = :id AND assigned_to_user = :oldAssignee")
  fun reassignTicket(id: String, oldAssignee: UserID, newAssignee: UserID): Boolean

  @SqlBatch("INSERT INTO ticket (id, showing_id, assigned_to_user, profile_id, barcode, customer_type, customer_type_definition, cinema, cinema_city, screen, seat_row, seat_number, date, time, movie_name, movie_rating, attributes) VALUES (:id, :showingId, :assignedToUser, :profileId, :barcode, :customerType, :customerTypeDefinition, :cinema, :cinemaCity, :screen, :seat.row, :seat.number, :date, :time, :movieName, :movieRating, :attributes)")
  fun insertTickets(@BindBean tickets: List<TicketDTO>)

  fun insertTicket(ticket: TicketDTO) = insertTickets(listOf(ticket))
}