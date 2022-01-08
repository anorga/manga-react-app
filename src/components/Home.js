import React from 'react';
import Container from 'react-bootstrap/Container';
import attack from './assets/attack.png';
import chainsaw from './assets/chainsaw.jpeg';
import jjk from './assets/jjk.jpg';
import { LinkContainer } from "react-router-bootstrap";
// import Helmet from "react-helmet";

function Home() {
    return (
        <Container>
            {/* Card One */}
            <div className="card mb-3" style={{ marginTop: 20, maxWidth: 800 }}>
                <div className="row g-0">
                    <LinkContainer to="/attack">
                        <div className="col" style={{ textAlign: 'left' }}>
                            <img src={attack} className="img-fluid rounded-start" alt="Attack on Titan Manga Cover" style={{ width: 269, height: 300 }} />
                        </div>
                    </LinkContainer>
                    <LinkContainer to="/attack" style={{ paddingRight: 50 }}>
                        <div className="col">
                            <div className="card-body">
                                <h5 className="card-title" style={{ marginTop: 10, marginBottom: 20 }}>Attack on Titan</h5>
                                <p className="card-text">After his hometown is destroyed and his mother is killed, Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.</p>
                            </div>
                        </div>
                    </LinkContainer>
                </div>
            </div>
            {/* Card Two */}
            <div className="card mb-3" style={{ maxWidth: 800 }}>
                <div className="row g-0">
                    <LinkContainer to="/chainsaw">
                        <div className="col" style={{ textAlign: 'left' }}>
                            <img src={chainsaw} className="img-fluid rounded-start" alt="Chainsaw Man Manga Cover" style={{ width: 269, height: 300 }} />
                        </div>
                    </LinkContainer>
                    <LinkContainer to="/chainsaw" style={{ paddingRight: 50 }}>
                        <div className="col">
                            <div className="card-body">
                                <h5 className="card-title">Chainsaw Man</h5>
                                <p className="card-text">When his father died, Denji was stuck with a huge debt. Thanks to a Devil dog he saved named Pochita, he's able to survive through odd jobs and killing Devils for the Yakuza.</p>
                            </div>
                        </div>
                    </LinkContainer>
                </div>
            </div>
            {/* Card Three */}
            <div className="card mb-3" style={{ maxWidth: 800 }}>
                <div className="row g-0">
                    <LinkContainer to="/jujutsu">
                        <div className="col" style={{ textAlign: 'left' }}>
                            <img src={jjk} className="img-fluid rounded-start" alt="Jujutsu Kaisen Manga Cover" style={{ width: 269, height: 300 }} />
                        </div>
                    </LinkContainer>
                    <LinkContainer to="/jujutsu" style={{ paddingRight: 50 }}>
                        <div className="col">
                            <div className="card-body">
                                <h5 className="card-title" style={{ marginTop: 10, marginBottom: 20 }}>Jujutsu Kaisen</h5>
                                <p className="card-text">Set in a world where Cursed Spirits feed on unsuspecting humans and fragments of the demon Ryomen Sukuna have been lost and scattered about.</p>
                            </div>
                        </div>
                    </LinkContainer>
                </div>
            </div>
        </Container>
    );
}

export default Home;