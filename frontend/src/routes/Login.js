import React, { Component } from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";
import { BASE_URL } from "../lib/withBaseURL";
import qs from "qs";
import background from "../assets/body_background.jpg";

const LoginContainer = styled.div`
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  display: flex;
  min-height: 100%;
  background-image: url(${background});
  background-repeat: no-repeat;
  background-color: black;
  justify-content: center;
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  min-height: 100%;
  flex-direction: column;
  background: white;
  max-width: 60em;
`;

const LoginDialog = styled.div`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .25);
  padding: 2em;
  background-color: #fff;
  border: solid 1px #9e9e9e;
  border-radius: 3px;
  text-align: center;
`;

const GoogleButton = styled.button`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .25);
  padding: 0.5em 1em;
  font-family: Roboto, sans-serif;
  font-size: 12pt;
  background-color: #fff;
  color: #212121;
  cursor: pointer;
  border: solid 1px #9e9e9e;
  border-radius: 3px;

  &:hover {
    background-color: #fafafa;
  }
`;

const GoogleLogo = styled.img`
  display: inline;
  height: 2em;
  vertical-align: middle;
  margin-right: 0.7em;
`;

const getRedirectUrl = searchString => {
  if (searchString && searchString.length > 0) {
    return qs.parse(searchString.substr(1)).return_to;
  }
};

class Login extends Component {
  handleGoogleRedirect = () => {
    const redirectParam = getRedirectUrl(this.props.location.search);

    window.location =
      BASE_URL +
      `/login/google?redirect=${encodeURIComponent(redirectParam || "/")}`;
  };

  render() {
    const { children, signedIn } = this.props;

    if (signedIn) {
      return (
        <Container>
          <ContentContainer>
            {children}
          </ContentContainer>
        </Container>
      );
    }

    return (
      <Container>
        <LoginContainer>
          <LoginDialog>
            <img
              src={require("../assets/logo.png")}
              height="260"
              alt="IT-bio logga"
            />
            <h3>Logga in för att boka biobesök!</h3>
            <GoogleButton onClick={this.handleGoogleRedirect}>
              <GoogleLogo src={require("../assets/google-logo.svg")} />
              Logga in via Google
            </GoogleButton>
          </LoginDialog>
        </LoginContainer>
      </Container>
    );
  }
}

export default withRouter(Login);
