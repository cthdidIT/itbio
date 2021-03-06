/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ForetagsbiljettStatus } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: SingleShowing
// ====================================================

export interface SingleShowing_me_foretagsbiljetter {
  __typename: "Foretagsbiljett";
  expires: SeFilmLocalDate;
  number: string;
  status: ForetagsbiljettStatus;
}

export interface SingleShowing_me {
  __typename: "CurrentUser";
  foretagsbiljetter: SingleShowing_me_foretagsbiljetter[] | null;
  id: SeFilmUserID;
}

export interface SingleShowing_showing_location {
  __typename: "Location";
  name: string;
}

export interface SingleShowing_showing_movie {
  __typename: "Movie";
  id: SeFilmUUID;
  title: string;
  poster: string | null;
  imdbId: SeFilmIMDbID | null;
}

export interface SingleShowing_showing_admin {
  __typename: "User";
  id: SeFilmUserID;
  name: string | null;
  nick: string | null;
}

export interface SingleShowing_showing_filmstadenScreen {
  __typename: "FilmstadenScreen";
  filmstadenId: string;
  name: string;
}

export interface SingleShowing_showing_payToUser {
  __typename: "User";
  id: SeFilmUserID;
}

export interface SingleShowing_showing_adminPaymentDetails_filmstadenData_user {
  __typename: "User";
  id: SeFilmUserID;
  nick: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface SingleShowing_showing_adminPaymentDetails_filmstadenData {
  __typename: "FilmstadenData";
  user: SingleShowing_showing_adminPaymentDetails_filmstadenData_user;
  filmstadenMembershipId: string | null;
  foretagsbiljett: string | null;
}

export interface SingleShowing_showing_adminPaymentDetails_participantPaymentInfos_user {
  __typename: "User";
  id: SeFilmUserID;
  nick: string | null;
  name: string | null;
  phone: string | null;
}

export interface SingleShowing_showing_adminPaymentDetails_participantPaymentInfos {
  __typename: "ParticipantPaymentInfo";
  id: SeFilmUUID;
  hasPaid: boolean;
  amountOwed: SeFilmSEK;
  user: SingleShowing_showing_adminPaymentDetails_participantPaymentInfos_user;
}

export interface SingleShowing_showing_adminPaymentDetails {
  __typename: "AdminPaymentDetails";
  filmstadenBuyLink: string | null;
  filmstadenData: SingleShowing_showing_adminPaymentDetails_filmstadenData[];
  participantPaymentInfos: SingleShowing_showing_adminPaymentDetails_participantPaymentInfos[];
}

export interface SingleShowing_showing_myTickets {
  __typename: "Ticket";
  id: string;
}

export interface SingleShowing_showing_attendeePaymentDetails_payTo {
  __typename: "User";
  id: SeFilmUserID;
  phone: string | null;
  firstName: string | null;
  nick: string | null;
  lastName: string | null;
}

export interface SingleShowing_showing_attendeePaymentDetails {
  __typename: "AttendeePaymentDetails";
  amountOwed: SeFilmSEK;
  swishLink: string | null;
  hasPaid: boolean;
  payTo: SingleShowing_showing_attendeePaymentDetails_payTo;
}

export interface SingleShowing_showing_participants_user {
  __typename: "User";
  avatar: string | null;
  firstName: string | null;
  nick: string | null;
  lastName: string | null;
  phone: string | null;
  id: SeFilmUserID;
}

export interface SingleShowing_showing_participants {
  __typename: "Participant";
  user: SingleShowing_showing_participants_user | null;
}

export interface SingleShowing_showing {
  __typename: "Showing";
  id: SeFilmUUID;
  webId: SeFilmBase64ID;
  slug: string;
  date: string;
  time: string;
  location: SingleShowing_showing_location;
  ticketsBought: boolean;
  movie: SingleShowing_showing_movie;
  admin: SingleShowing_showing_admin;
  price: SeFilmSEK | null;
  private: boolean;
  filmstadenRemoteEntityId: string | null;
  filmstadenScreen: SingleShowing_showing_filmstadenScreen | null;
  payToUser: SingleShowing_showing_payToUser;
  adminPaymentDetails: SingleShowing_showing_adminPaymentDetails | null;
  myTickets: SingleShowing_showing_myTickets[] | null;
  attendeePaymentDetails: SingleShowing_showing_attendeePaymentDetails | null;
  participants: SingleShowing_showing_participants[];
}

export interface SingleShowing {
  me: SingleShowing_me;
  showing: SingleShowing_showing | null;
}

export interface SingleShowingVariables {
  webId: SeFilmBase64ID;
}
