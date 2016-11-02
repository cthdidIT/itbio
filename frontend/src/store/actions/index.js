import { browserHistory } from 'react-router'

export const WAITING_SIGN_OUT = 'WAITING_SIGN_OUT'
export const SIGN_OUT = 'SIGN_OUT'

export const WAITING_SIGN_IN = 'WAITING_SIGN_IN'
export const SIGN_IN_FAILED = 'SIGN_IN_FAILED'
export const SIGN_IN = 'SIGN_IN'

export const WAITING_UPDATE_ME = 'WAITING_UPDATE_ME'
export const UPDATE_ME = 'UPDATE_ME'

export const FETCH_SHOWINGS = 'FETCH_SHOWINGS'
export const FETCH_SHOWING = 'FETCH_SHOWING'
export const FETCH_TIME_SLOTS = 'FETCH_TIME_SLOTS'
export const SHOWING_ATTENDEES_CHANGE = 'SHOWING_ATTENDEES_CHANGE'
export const SHOWING_STATUS_CHANGE = 'SHOWING_STATUS_CHANGE'

export const SUBMIT_SLOTS_PICKED = 'SUBMIT_SLOTS_PICKED'
export const WAITING_SUBMIT_SLOTS_PICKED = 'WAITING_SUBMIT_SLOTS_PICKED'

export const WAITING_SLOT_PICKED = 'WAITING_SLOT_PICKED'
export const FETCH_GIFT_CARDS = 'FETCH_GIFT_CARDS'

export const SUBMIT_GIFT_CARD = 'SUBMIT_GIFT_CARD'
export const WAITING_SUBMIT_GIFT_CARD = 'WAITING_SUBMIT_GIFT_CARD'
export const UPDATE_CARD_FOR_USER = 'UPDATE_CARD_FOR_USER'
export const REMOVE_CARD_FROM_USER = 'REMOVE_CARD_FROM_USER'

export const FETCH_PAYMENT_METHOD = 'FETCH_PAYMENT_METHOD'

import { fetchEndpoint, postEndpoint, putEndpoint, deleteEndpoint } from '../../service/backend'

export const signIn = (authData) => (dispatch) => {
  dispatch({ type: WAITING_SIGN_IN })

  postEndpoint('/authenticate', authData).then(data => {
    dispatch({ type: SIGN_IN, ...data })
    browserHistory.push(`/showings`);
  }).catch(err => {
    console.error("Error during sign in", err);
    dispatch({ type: SIGN_IN_FAILED })
  })
}

export const signOut = () => (dispatch) => {
  browserHistory.push('/')
  dispatch({ type: WAITING_SIGN_OUT })

  fetchEndpoint('/signout').catch(err => {
    console.error("Error during sign out", err);
  }).then(() => {
    dispatch({
      type: SIGN_OUT
    })
  })
}

export const updateUser = (user) => (dispatch) => {
  dispatch({
    type: WAITING_UPDATE_ME
  })
  putEndpoint('/me', { user }).then((user) => {
    dispatch({
      type: UPDATE_ME,
      user
    })
  }).catch(err => {
    console.error("Error during user update", err);
  })
}

export const fetchShowings = () => (dispatch) => {
  fetchEndpoint('/showings').then(({ showings }) => {

    let showingsObj = showings.reduce((acc, showing) => {
      acc[showing.id] = showing
      return acc
    }, {})

    dispatch({
      type: FETCH_SHOWINGS,
      showings: showingsObj
    })
  }).catch(err => {
    console.error("Error during showings fetch", err);
  })
}

export const fetchShowing = (id) => (dispatch) => {
  fetchEndpoint(`/showings/${id}`).then(({showing}) => {

    dispatch({
      type: FETCH_SHOWING,
      showing
    })
  }).catch(err => {
    console.error(`Error during showing(${id}) fetch`, err);
  })
}

export const postAttendStatusChange = (id, status) => (dispatch) => {
  postEndpoint(`/showings/${id}/${status}`).then(({ attendees }) => {

    dispatch({
      type: SHOWING_ATTENDEES_CHANGE,
      showingId: id,
      attendees
    })
  }).catch(err => {
    console.error(`Error during post status change(${id}, ${status})`, err);
  })
}

export const fetchTimeSlotsForShowing = (id) => (dispatch) => {
  fetchEndpoint(`/showings/${id}/time_slots/votes`).then(({ time_slots }) => {

    dispatch({
      type: FETCH_TIME_SLOTS,
      showingId: id,
      time_slots
    })
  }).catch(err => {
    console.error(`Error during time_slots(${id}) fetch` );
    throw err;
  })
}

export const postShowingOrdered = (id) => (dispatch) => {
  postEndpoint(`/showings/${id}/order`).then(() => {

    dispatch({
      type: SHOWING_STATUS_CHANGE,
      showingId: id,
      status: "ordered"
    })
  }).catch(err => {
    console.error(`Error during post status change(${id}, ${status})`, err);
  })
};

export const postShowingDone = (id) => (dispatch) => {
  postEndpoint(`/showings/${id}/done`).then(() => {

    dispatch({
      type: SHOWING_STATUS_CHANGE,
      showingId: id,
      status: "done"
    })
  }).catch(err => {
    console.error(`Error during post status change(${id}, ${status})`, err);
  })
};

const submitTimeSlots = (id, data) => (dispatch) => {
  dispatch({
    type: WAITING_SUBMIT_SLOTS_PICKED
  });

  postEndpoint(`/showings/${id}/time_slots/votes`, data).then(data => {
    dispatch({
      type: FETCH_TIME_SLOTS,
      showingId: id,
      time_slots: data.time_slots
    })
  }).catch(err => {
      console.error('Error during fetch time slots');
      throw err;
  });
}

export const submitAddSlotPickedForShowing = (id, id_to_add) => (dispatch) => {
  return submitTimeSlots(id, {add_ids: [id_to_add]})(dispatch)
};

export const submitRemoveSlotPickedForShowing = (id, id_to_remove) => (dispatch) => {
  return submitTimeSlots(id, {remove_ids: [id_to_remove]})(dispatch)
};

export const submitTimeSlotForShowing = (showing_id, slot_id) => (dispatch) => {
  dispatch({
    type: WAITING_SLOT_PICKED
  });

  postEndpoint(`/showings/${showing_id}/complete`, {
    slot_id
  }).then(({showing}) => {
    dispatch({
      type: FETCH_SHOWING,
      showing
    })
  }).catch(err => {
    console.error('Error, could not submit time slot for showing');
    throw err;
  });
};

export const fetchGiftCards = () => (dispatch) => {
  fetchEndpoint(`/gift_cards/me`)
      .then(gift_cards => {
        dispatch({
          type: FETCH_GIFT_CARDS,
          giftCards: gift_cards
        })
      })
      .catch(err => {
        console.error('Error, cannot fetch /gift_cards/me');
        throw err
      });

};
export const submitGiftCard = (card) => (dispatch) => {
    dispatch({
      type: WAITING_SUBMIT_GIFT_CARD
    });
  postEndpoint('/gift_cards', { gift_card: card }).then((card) => {
    dispatch({
      type: UPDATE_CARD_FOR_USER,
      card
  })
  }).catch(err => {
    console.error("Error during user update", err);
    throw err;
  });
};

export const removeCard = (cardId) => (dispatch) => {
  deleteEndpoint(`/gift_cards/${cardId}`).then(resp => {
    dispatch({
      type: REMOVE_CARD_FROM_USER,
      cardId
    })
  }).catch(err => {
    console.error("Error during removal of card", err);
    throw err
  })
};

export const selectPayment = (showingId, cardId) => (dispatch) => {

  postEndpoint(`/showings/${showingId}/payment_method`, {
    cardId
  }).then(({attendee}) => {
    dispatch({
      type: FETCH_PAYMENT_METHOD,
      attendee,
      showingId
    })
  }).catch(err => {
    console.error('Error during payment method selection');
    throw err
  })
};

