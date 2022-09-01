import React from 'react';
import Container from 'react-bootstrap/Container';
import attack from './assets/attack.png';
import chainsaw from './assets/chainsaw.jpeg';
import jjk from './assets/jjk.jpg';
import { Link } from 'react-router-dom';
import animeBanner from './assets/animeBanner.jpeg';


function Home() {
    return (
        <Container>
            <img src={animeBanner}  className="img-fluid" id="animeBanner" alt="Anime banner"/>
            {/* <h1 id="title">Manga</h1> */}
            <ul className="list-group list-group-flush list-main">
                {/* Card One */}
                <li className="list-group-item list-group-item-action manga-li" >
                    <Link to="/attack">
                        <div className="mangaList">
                            <img src={attack} className="img-fluid rounded-start homeImage" alt="Attack on Titan Manga Cover" />
                            <div className="homeText">
                                <h5 className="card-title">Attack on Titan</h5>
                                <p className="card-text">After his hometown is destroyed and his mother is killed, Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.</p>
                            </div>
                        </div>
                    </Link>
                </li>

                {/* Card Two */}
                <li className="list-group-item list-group-item-action manga-li">
                    <Link to="/chainsaw">
                        <div className="mangaList">
                            <img src={chainsaw} className="img-fluid rounded-start homeImage" alt="Chainsaw Man Manga Cover" />
                            <div className="homeText">
                                <h5 className="card-title">Chainsaw Man</h5>
                                <p className="card-text">When his father died, Denji was stuck with a huge debt. Thanks to a Devil dog he saved named Pochita, he's able to survive through odd jobs and killing Devils for the Yakuza.</p>
                            </div>
                        </div>
                    </Link>
                </li>

                {/* Card Three */}
                <li className="list-group-item list-group-item-action manga-li">
                    <Link to="/jujutsu">
                        <div className="mangaList">
                            <img src={jjk} className="img-fluid rounded-start homeImage" alt="Jujutsu Kaisen Manga Cover" />
                            <div className="homeText">
                                <h5 className="card-title">Jujutsu Kaisen</h5>
                                <p className="card-text">Set in a world where Cursed Spirits feed on unsuspecting humans and fragments of the demon Ryomen Sukuna have been lost and scattered about.</p>
                            </div>
                        </div>
                    </Link>
                </li>

            </ul>
        </Container>
    );
}

export default Home;