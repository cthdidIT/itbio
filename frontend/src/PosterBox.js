import React, { PropTypes } from "react";
import styled from "styled-components";
import alfons from "./assets/alfons.jpg";


const PaddingContainer = styled.div`
  flex: 1;
  padding: 1em;
`;

const Poster = styled.div`
    background-image: url(${props => props.src});
    background-size: cover;
    height: 100%;
    width: 100px;
`;

const Header = styled.h3`
    font-weight: 300;
    padding: 0;
    margin: 0;
    overflow: hidden;
`;

const PosterBox = ({ className, poster, headerText, children }) => (
    <div className={className}>
        <Poster src={poster || alfons}/>
        <PaddingContainer>
            <Header>{headerText}</Header>
            {children}
        </PaddingContainer>
    </div>
);

PosterBox.propTypes = {
    poster: PropTypes.string,
    headerText: PropTypes.string.isRequired
};

export default styled(PosterBox)`
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    display: flex;
    height: 150px;
    width: 100%;
`;
