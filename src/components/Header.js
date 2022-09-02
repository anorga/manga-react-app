import React from "react";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import rengoku from "./assets/rengoku.webp";
import { Link } from "react-router-dom";

function Header() {
    return (
        <Navbar sticky="top" bg="dark" variant="dark" expand="lg">
            <Container>
                <Link to="/" style={{textDecoration: 'none'}}>
                    <Navbar.Brand>
                        <img
                            src={rengoku}
                            width="50"
                            height="44"
                            className="d-inline-block"
                            alt="Read Manga Online Logo"
                            style={{ marginRight: 15, borderRadius: 4 }}
                        /><span>Read Manga Online</span>
                    </Navbar.Brand>
                </Link>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end mangaNav">
                    <Nav>
                        <Link to="/" style={{textDecoration: 'none', color: '#ffffff8c', marginTop: '20px'}}><span className="d-inline d-sm-none">Home</span></Link>
                        <NavDropdown title="Manga List" id="basic-nav-dropdown" menuVariant="dark">
                            <Link to="/attack" style={{display: 'block', textDecoration: 'none', color: '#dee2e6', paddingLeft: '15px'}} className="dropdownItem">Attack on Titan</Link>
                            <Link to="/chainsaw" style={{display: 'block', textDecoration: 'none', color: '#dee2e6', paddingLeft: '15px'}} className="dropdownItem">Chainsaw Man</Link>
                            <Link to="/jujutsu" style={{display: 'block', textDecoration: 'none', color: '#dee2e6', paddingLeft: '15px'}} className="dropdownItem">Jujutsu Kaisen</Link>
                        </NavDropdown>
                        <Nav.Link>Log In</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;