import { applyMiddleware, combineReducers, createStore, compose } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import throttle from 'lodash/throttle';

import { loadState, saveState } from "./localStorage";
import rest from "./reducers/rest";

const persistedState = loadState();


const createStoreWithMiddleware = compose(
    applyMiddleware(
        thunk,
        logger
    ), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)(createStore);
const reducer = combineReducers(rest.reducers);
const store = createStoreWithMiddleware(reducer, persistedState);

store.subscribe(throttle(() => {
    saveState(store.getState());
}, 1000));

export default store;