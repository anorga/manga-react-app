import React from "react";
import rengoku from "./assets/rengoku.webp";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';

function Header() {
    return (
        <Navbar sticky="top" bg="light" expand="lg">
            <Container>
                <Navbar.Brand href="#home">
                    <img
                        src={rengoku}
                        width="50"
                        height="44"
                        className="d-inline-block"
                        alt="React Bootstrap logo"
                    />{' '} Read Manga
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="#home">Home</Nav.Link>
                        <NavDropdown title="Manga List" id="basic-nav-dropdown">
                            <NavDropdown.Item href="#attack">Attack on Titan</NavDropdown.Item>
                            <NavDropdown.Item href="#chainsaw">Chainsaw Man</NavDropdown.Item>
                            <NavDropdown.Item href="#jujutsu">Jujutsu Kaisen</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;