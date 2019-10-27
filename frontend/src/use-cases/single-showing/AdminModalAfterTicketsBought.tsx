import * as React from "react";
import { useCallback } from "react";
import { useTogglePaidChange } from "../../apollo/mutations/showings/useTogglePaidChange";
import StatusMessageBox from "../common/utils/StatusMessageBox";
import { PaymentParticipantsList } from "./components/PaymentParticipantsList";
import { SingleShowing_showing_adminPaymentDetails_attendees } from "./containers/__generated__/SingleShowing";
import { InputSpinner } from "./InputSpinner";

interface AdminModalAfterTicketsBoughtProps {
  showingId: string;
  participantPaymentInfos: SingleShowing_showing_adminPaymentDetails_attendees[];
}

export const AdminModalAfterTicketsBought: React.FC<
  AdminModalAfterTicketsBoughtProps
> = ({ showingId, participantPaymentInfos }) => {
  const [
    togglePaidChange,
    { loading: mutationInProgress, error: mutationError }
  ] = useTogglePaidChange();

  const handlePaidChange = useCallback(
    (info: SingleShowing_showing_adminPaymentDetails_attendees) => {
      const { user, hasPaid, amountOwed } = info;

      togglePaidChange({
        variables: {
          paymentInfo: {
            amountOwed,
            hasPaid,
            showingId: showingId,
            userId: user.id
          }
        }
      });
    },
    [showingId, togglePaidChange]
  );

  return (
    <>
      <PaymentParticipantsList
        handlePaidChange={handlePaidChange}
        participants={participantPaymentInfos}
      />
      {mutationInProgress && <InputSpinner />}
      <StatusMessageBox errors={mutationError ? [mutationError] : null} />
    </>
  );
};
