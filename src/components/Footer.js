import React from 'react';
import Container from 'react-bootstrap/Container';
import github from './assets/github.png';
import email from './assets/email.png';

function Footer() {
    return (
        <Container style={{ textAlign: "left", marginTop: 20, marginBottom: 10 }}>
            <a href="https://github.com/anorga">
                <img
                    src={github}
                    width="41"
                    height="41"
                    className="d-inline-block"
                    alt="React Bootstrap logo"
                />
            </a>
            <a href="https://github.com/anorga">
                <img
                    src={email}
                    width="41"
                    height="41"
                    className="d-inline-block"
                    alt="React Bootstrap logo"
                />
            </a>
            <p className="d-inline-block">&#169; 2022 Christian Anorga</p>
        </Container>
    );
}

export default Footer;