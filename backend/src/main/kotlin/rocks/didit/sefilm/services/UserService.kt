package rocks.didit.sefilm.services

import org.springframework.stereotype.Component
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.*
import rocks.didit.sefilm.domain.dto.FöretagsbiljettDTO
import rocks.didit.sefilm.domain.dto.LimitedUserDTO
import rocks.didit.sefilm.domain.dto.UserDTO
import rocks.didit.sefilm.domain.dto.UserDetailsDTO
import rocks.didit.sefilm.orElseThrow

@Component
class UserService(private val userRepo: UserRepository,
                  private val foretagsbiljettService: FöretagsbiljettService) {
  fun allUsers(): List<LimitedUserDTO> = userRepo.findAll().map { it.toLimitedUserDTO() }
  fun getUser(id: UserID): LimitedUserDTO? = userRepo.findById(id).map { it.toLimitedUserDTO() }.orElse(null)
  fun getUserOrThrow(id: UserID): LimitedUserDTO = getUser(id).orElseThrow { NotFoundException("user", id) }

  /** Get the full user with all fields. Use with care since this contains sensitive fields */
  fun getCompleteUser(id: UserID): User?
    = userRepo.findById(id)
    .orElse(null)

  fun currentUser(): UserDTO {
    val userID = currentLoggedInUser()
    return getCompleteUser(userID)
      ?.toDTO()
      .orElseThrow { NotFoundException("current user", userID) }
  }

  fun getParticipantEmailAddresses(participants: Collection<Participant>): List<String> {
    val userIds = participants.map { it.extractUserId() }
    return userRepo
      .findAllById(userIds)
      .map { it.email }
  }

  fun updateUser(newDetails: UserDetailsDTO): UserDTO {
    val newSfMembershipId = when {
      newDetails.sfMembershipId == null || newDetails.sfMembershipId.isBlank() -> null
      else -> SfMembershipId.valueOf(newDetails.sfMembershipId)
    }

    val newPhoneNumber = when {
      newDetails.phone == null || newDetails.phone.isBlank() -> null
      else -> PhoneNumber(newDetails.phone)
    }

    val currentUserId = currentLoggedInUser()
    val updatedUser = getCompleteUser(currentUserId).orElseThrow { NotFoundException("current user", currentUserId) }.copy(
      phone = newPhoneNumber,
      nick = newDetails.nick,
      sfMembershipId = newSfMembershipId
    )

    return userRepo.save(updatedUser).toDTO()
  }

  private fun User.toDTO() = UserDTO(this.id,
    this.name,
    this.firstName,
    this.lastName,
    this.nick,
    this.email,
    this.sfMembershipId?.value,
    this.phone?.number,
    this.avatar,
    this.foretagsbiljetter.map { it.toDTO() },
    this.lastLogin,
    this.signupDate)

  private fun Företagsbiljett.toDTO(): FöretagsbiljettDTO {
    return FöretagsbiljettDTO(this.number.number, this.expires, foretagsbiljettService.getStatusOfTicket(this))
  }
}