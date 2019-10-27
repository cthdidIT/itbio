import styled from "@emotion/styled";
import gql from "graphql-tag";
import React from "react";

const PaddingContainer = styled.div`
  flex: 1;
  padding: 1em;
`;

const Poster = styled.div<{ src: string }>`
  background-image: url(${props => props.src});
  background-size: cover;
  height: 96px;
  width: 96px;
`;

const Header = styled.h3`
  font-weight: 300;
  padding: 0;
  margin: 0;
  overflow: hidden;
`;

interface Props {
  className?: string;
  showPhone: boolean;
  user: {
    phone: string | null;
    avatar: string | null;
    firstName: string | null;
    nick: string | null;
    lastName: string | null;
  };
}

const UserItem: React.FC<Props> = ({
  className,
  showPhone,
  user,
  children
}) => (
  <div className={className}>
    <Poster src={user.avatar!} />
    <PaddingContainer>
      <Header>
        {user.firstName} '{user.nick}' {user.lastName}
      </Header>
      {showPhone && user.phone && <span>{user.phone}</span>}
      {children}
    </PaddingContainer>
  </div>
);

export const fragments = {
  user: gql`
    fragment UserItem on PublicUserDTO {
      avatar
      firstName
      nick
      lastName
      phone
    }
  `
};

export default styled(UserItem)`
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  height: 96px;
  width: 100%;
  margin-bottom: 0.5em;
  margin-left: 0.5em;
  @media (min-width: 500px) {
    max-width: 100%;
  }
  @media (min-width: 700px) {
    max-width: 48%;
  }
`;
