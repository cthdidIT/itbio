package rocks.didit.sefilm.notification

/** Don't forget to update the corresponding GraphQL enum */
enum class NotificationType {
    UpdateShowing,
    NewShowing,
    DeletedShowing,
    TicketsBought,
    UserAttended,
    UserUnattended,
}