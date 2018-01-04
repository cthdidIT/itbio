package rocks.didit.sefilm.services

import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Component
import rocks.didit.sefilm.*
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.domain.Företagsbiljett
import rocks.didit.sefilm.domain.TicketNumber
import rocks.didit.sefilm.domain.UserID

@Component
class AssertionService(
  private val userService: UserService,
  private val foretagsbiljettService: FöretagsbiljettService) {

  fun assertTicketsNotBought(userID: UserID, showing: Showing) {
    if (showing.ticketsBought) {
      throw TicketsAlreadyBoughtException(userID, showing.id)
    }
  }

  fun assertUserNotAlreadyAttended(userID: UserID, showing: Showing) {
    if (showing.participants.any { it.hasUserId(userID) }) {
      throw UserAlreadyAttendedException(userID)
    }
  }

  fun assertLoggedInUserIsAdmin(showing: Showing) {
    if (currentLoggedInUser() != showing.admin) {
      throw AccessDeniedException("Only the showing admin is allowed to do that")
    }
  }

  fun assertUserHasPhoneNumber(userID: UserID) {
    val user = userService.getUserOrThrow(userID)
    if (user.phone == null || user.phone.isBlank()) {
      throw MissingPhoneNumberException(userID)
    }
  }

  fun assertForetagsbiljettIsAvailable(userId: UserID, suppliedTicket: TicketNumber) {
    val matchingTickets = foretagsbiljettService
      .getFöretagsbiljetterForUser(userId)
      .filter { it.number == suppliedTicket }

    if (matchingTickets.isEmpty()) {
      throw TicketNotFoundException(suppliedTicket)
    }
    if (matchingTickets.size > 1) {
      throw DuplicateTicketException(": $suppliedTicket")
    }

    if (foretagsbiljettService.getStatusOfTicket(matchingTickets.first()) != Företagsbiljett.Status.Available) {
      throw BadRequestException("Ticket has already been used: " + suppliedTicket.number)
    }
  }

}