import React from 'react';
import Container from 'react-bootstrap/Container';
import github from './assets/github.png';

function Footer() {
    return (
        <Container style={{ textAlign: "left" }}>
            <a href = "https://github.com/anorga">
                <img
                src={github}
                width="44"
                height="44"
                className="d-inline-block"
                alt="React Bootstrap logo"
            />
            </a>{' '}Created by: Chris
        </Container>

    );
}

export default Footer;