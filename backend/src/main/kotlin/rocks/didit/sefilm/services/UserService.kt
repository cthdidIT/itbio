package rocks.didit.sefilm.services

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.Företagsbiljett
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.SfMembershipId
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.*
import rocks.didit.sefilm.notification.MailNotificationSettings
import rocks.didit.sefilm.notification.PushoverNotificationSettings
import rocks.didit.sefilm.orElseThrow
import rocks.didit.sefilm.services.external.PushoverService
import rocks.didit.sefilm.services.external.PushoverValidationStatus
import java.util.*

@Service
class UserService(private val userRepo: UserRepository,
                  private val pushoverService: PushoverService?,
                  private val foretagsbiljettService: ForetagsbiljettService) {

  private val log: Logger = LoggerFactory.getLogger(this.javaClass)

  fun allUsers(): List<LimitedUserDTO> = userRepo.findAll().map { it.toLimitedUserDTO() }
  fun getUser(id: UserID): LimitedUserDTO? = userRepo.findById(id).map { it.toLimitedUserDTO() }.orElse(null)
  fun getUserOrThrow(id: UserID): LimitedUserDTO = getUser(id).orElseThrow { NotFoundException("user", id) }
  fun getUsersThatWantToBeNotified(): List<User> {
    return userRepo.findAll()
      .filter { it.notificationSettings.any { it.enabled } }
  }

  /** Get the full user with all fields. Use with care since this contains sensitive fields */
  fun getCompleteUser(id: UserID): User
    = userRepo.findById(id)
    .orElseThrow { NotFoundException("user", userID = id) }

  fun getCurrentUser(): UserDTO {
    return currentLoggedInUser().let {
      getCompleteUser(it).toDTO()
    }
  }

  fun getCompleteCurrentUser(): User = getCompleteUser(currentLoggedInUser())

  fun updateUser(newDetails: UserDetailsDTO): UserDTO {
    val newSfMembershipId = when {
      newDetails.sfMembershipId == null || newDetails.sfMembershipId.isBlank() -> null
      else -> SfMembershipId.valueOf(newDetails.sfMembershipId)
    }

    val newPhoneNumber = when {
      newDetails.phone == null || newDetails.phone.isBlank() -> null
      else -> PhoneNumber(newDetails.phone)
    }

    val updatedUser = getCompleteCurrentUser().copy(
      phone = newPhoneNumber,
      nick = newDetails.nick,
      sfMembershipId = newSfMembershipId
    )

    return userRepo.save(updatedUser).toDTO()
  }

  // TODO: listen for PushoverUserKeyInvalid and disable the key
  fun updateNotificationSettings(notificationInput: NotificationInputDTO): UserDTO {
    val currentUser = getCompleteCurrentUser()
    log.trace("Update notification settings for user={} settings to={}", currentUser.id, notificationInput)

    val mailSettings = notificationInput.mail.let {
      MailNotificationSettings(it?.enabled ?: false, it?.mail ?: "${currentUser.firstName?.toLowerCase()}@example.org")
    }
    val pushoverSettings = notificationInput.pushover?.let {
      val validatedUserKeyStatus = pushoverService?.validateUserKey(it.userKey, it.device) ?: PushoverValidationStatus.UNKNOWN
      PushoverNotificationSettings(it.enabled, it.userKey, it.device, validatedUserKeyStatus)
    } ?: PushoverNotificationSettings()

    return currentUser.copy(
      enabledNotifications = notificationInput.enabledNotifications,
      notificationSettings = listOf(mailSettings, pushoverSettings)
    ).let {
      userRepo.save(it)
    }.toDTO()
  }

  fun lookupUserFromCalendarFeedId(calendarFeedId: UUID): UserDTO?
    = userRepo
    .findByCalendarFeedId(calendarFeedId)
    ?.toDTO()

  fun invalidateCalendarFeedId(): UserDTO {
    return getCompleteCurrentUser()
      .copy(calendarFeedId = UUID.randomUUID())
      .let { userRepo.save(it) }.toDTO()
  }

  fun disableCalendarFeed(): UserDTO {
    return getCompleteCurrentUser()
      .copy(calendarFeedId = null)
      .let { userRepo.save(it) }.toDTO()
  }

  fun User.toDTO() = UserDTO(this.id,
    this.name,
    this.firstName,
    this.lastName,
    this.nick,
    this.email,
    this.sfMembershipId?.value,
    this.phone?.number,
    this.avatar,
    this.foretagsbiljetter.map { it.toDTO() },
    this.notificationSettings,
    this.enabledNotifications,
    this.lastLogin,
    this.signupDate,
    this.calendarFeedId)

  private fun Företagsbiljett.toDTO(): ForetagsbiljettDTO {
    return ForetagsbiljettDTO(this.number.number, this.expires, foretagsbiljettService.getStatusOfTicket(this))
  }
}