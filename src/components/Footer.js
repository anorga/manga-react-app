import React from 'react';
import Container from 'react-bootstrap/Container';
import github from './assets/github.png';
import email from './assets/email.png';

function Footer() {
    return (
        <Container style={{ marginTop: 70, marginBottom: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <a href="https://github.com/anorga" target="_blank">
                <img
                    src={github}
                    width="41"
                    height="41"
                    alt="React Bootstrap logo"
                />
            </a>
            <a href="mailto: anorga2990@gmail.com">
                <img
                    src={email}
                    width="25"
                    height="25"
                    style={{ marginRight: 10 }}
                    alt="Email logo"
                />
            </a>
            <p style={{ marginTop: 20 }}>&#169; 2022 Christian Anorga</p>
        </Container>
    );
}

export default Footer;