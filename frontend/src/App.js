import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { graphql } from "react-apollo";
import { compose, branch, renderComponent } from "recompose";
import gql from "graphql-tag";
import styled from "styled-components";
import Helmet from "react-helmet";

import asyncComponent from "./use-cases/common/utils/AsyncComponent";
import TopBar from "./use-cases/common/ui/TopBar";
import Footer from "./use-cases/common/ui/footer/Footer";
import WelcomeModal from "./use-cases/common/utils/WelcomeModal";
import { completeUserFragment } from "./apollo/queries/currentUser";
import Loader from "./use-cases/common/utils/ProjectorLoader";
import { UUIDToWebId } from "./use-cases/common/utils/UUIDToWebId";

const ScrollContainer = styled.div`
  display: grid;
  height: 100vh;
  grid-template-rows: min-content auto;
  grid-template-areas:
    "top"
    "content";
  -webkit-overflow-scrolling: touch;
`;

const MainGridContainer = styled.div`
  grid-area: content;
  display: grid;
  grid-template-columns: minmax(1rem, 1fr) minmax(min-content, 1000px) minmax(1rem, 1fr);
  grid-template-areas:
    "jumbo jumbo jumbo"
    ". center ."
    "footer footer footer";
  background-color: #f8f8f8;
  align-items: start;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`;

const AsyncHome = asyncComponent(() => import("./use-cases/my-showings/Home"));
const AsyncUser = asyncComponent(() => import("./use-cases/user/index"));
const AsyncShowings = asyncComponent(() =>
  import("./use-cases/showings-list/Showings")
);
const AsyncNewShowing = asyncComponent(() =>
  import("./use-cases/new-showing/NewShowing")
);
const AsyncEditShowing = asyncComponent(() =>
  import("./use-cases/edit-showing/EditShowing")
);
const AsyncShowingTickets = asyncComponent(() =>
  import("./use-cases/showing-tickets/index")
);
const AsyncSingleShowing = asyncComponent(() =>
  import("./use-cases/single-showing/screen/SingleShowingScreen")
);

const App = ({ data: { me }, signout }) => (
  <React.Fragment>
    <Helmet titleTemplate="%s | itbio" />
    <WelcomeModal me={me} />
    <ScrollContainer>
      <TopBar signout={signout} />
      <MainGridContainer>
        <Switch>
          <Route exact path="/" component={AsyncHome} />
          <Route path="/user" component={AsyncUser} />
          <Route exact path="/showings" component={AsyncShowings} />
          <Route path="/showings/new/:movieId?" component={AsyncNewShowing} />
          <Route
            path="/showings/:webId/:slug/tickets"
            component={AsyncShowingTickets}
          />
          <Route
            path="/showings/:webId/:slug/edit"
            component={AsyncEditShowing}
          />
          <Route path="/showings/:webId/:slug" component={AsyncSingleShowing} />
          <Route
            path="/showings/:showingId/:rest?"
            render={props => (
              <UUIDToWebId {...props.match.params}>
                {({ webId, slug }) => (
                  <Redirect to={`/showings/${webId}/${slug}`} />
                )}
              </UUIDToWebId>
            )}
          />
        </Switch>
        <Footer />
      </MainGridContainer>
    </ScrollContainer>
  </React.Fragment>
);

const data = graphql(gql`
  query AppQuery {
    me: currentUser {
      ...CompleteUser
    }
  }
  ${completeUserFragment}
`);

const isLoading = branch(({ data: { me } }) => !me, renderComponent(Loader));

export default compose(
  data,
  isLoading
)(App);
