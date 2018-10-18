import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { wrapMutate } from "../../store/apollo";

export const markAsBought = graphql(
  gql`
    mutation MarkShowingAsBought(
      $showingId: UUID!
      $showing: UpdateShowingInput
    ) {
      updateShowing(showingId: $showingId, newValues: $showing) {
        id
      }

      markAsBought(showingId: $showingId) {
        id
        ticketsBought
        price
        private
        payToUser {
          id
        }
        expectedBuyDate
        time
        myTickets {
          id
        }
        attendeePaymentDetails {
          payTo {
            id
            nick
            firstName
            lastName
            phone
          }
          swishLink
          hasPaid
          amountOwed
        }
        adminPaymentDetails {
          participantPaymentInfos {
            id
            hasPaid
            amountOwed
            user {
              id
              nick
              name
              phone
            }
          }
        }
      }
    }
  `,
  {
    props: ({ mutate }) => ({
      markShowingBought: (showingId, { showing }) =>
        wrapMutate(mutate, { showing, showingId })
    }),
    options: {
      refetchQueries: ["ShowingsQuery"]
    }
  }
);

export const updateShowing = graphql(
  gql`
    mutation UpdateShowing($showingId: UUID!, $showing: UpdateShowingInput!) {
      updateShowing(showingId: $showingId, newValues: $showing) {
        id
        time
        date
        ticketsBought
        price
        private
        payToUser {
          id
        }
        expectedBuyDate
      }
    }
  `,
  {
    props: ({ mutate }) => ({
      updateShowing: (showingId, showing) =>
        wrapMutate(mutate, { showing, showingId })
    })
  }
);

export const deleteShowing = graphql(
  gql`
    mutation DeleteShowing($showingId: UUID!) {
      deleteShowing(showingId: $showingId) {
        id
      }
    }
  `,
  {
    props: ({ mutate }) => ({
      deleteShowing: showingId => wrapMutate(mutate, { showingId })
    }),
    options: {
      refetchQueries: ["ShowingsQuery"]
    }
  }
);

export const togglePaidChange = graphql(
  gql`
    mutation TogglePaidChange($paymentInfo: ParticipantPaymentInput!) {
      updateParticipantPaymentInfo(paymentInfo: $paymentInfo) {
        id
        hasPaid
      }
    }
  `,
  {
    props: ({ mutate }) => ({
      togglePaidChange: paymentInfo => wrapMutate(mutate, { paymentInfo })
    }),
    options: {
      refetchQueries: ["ShowingsQuery"]
    }
  }
);

export const promoteToAdmin = graphql(
  gql`
    mutation PromoteToAdmin($showingId: UUID!, $userId: UserID!) {
      promoteToAdmin(showingId: $showingId, userToPromote: $userId) {
        admin {
          id
        }
        payToUser {
          id
        }
        attendeePaymentDetails {
          payTo {
            id
            nick
            firstName
            lastName
            phone
          }
          swishLink
          hasPaid
          amountOwed
        }
      }
    }
  `,
  {
    options: {
      refetchQueries: ["SingleShowing"]
    },
    props: ({ mutate }) => ({
      promoteToAdmin: (showingId, userId) =>
        wrapMutate(mutate, { showingId, userId })
    })
  }
);
const participantsFragment = gql`
  fragment ShowingParticipant on Showing {
    id
    participants {
      paymentType
      user {
        id
        nick
        firstName
        lastName
        avatar
      }
    }
  }
`;
export const attendShowing = graphql(
  gql`
    mutation AttendShowing($showingId: UUID!, $paymentOption: PaymentOption!) {
      attendShowing(showingId: $showingId, paymentOption: $paymentOption) {
        ...ShowingParticipant
      }
    }
    ${participantsFragment}
  `,
  {
    props: ({ mutate, ownProps: { showingId } }) => ({
      attendShowing: ({ paymentOption }) =>
        wrapMutate(mutate, { showingId, paymentOption })
    })
  }
);
export const unattendShowing = graphql(
  gql`
    mutation UnattendShowing($showingId: UUID!) {
      unattendShowing(showingId: $showingId) {
        ...ShowingParticipant
      }
    }
    ${participantsFragment}
  `,
  {
    props: ({ mutate, ownProps: { showingId } }) => ({
      unattendShowing: () => wrapMutate(mutate, { showingId })
    })
  }
);