import React from 'react';
import Container from 'react-bootstrap/Container';

function Home() {
    return (
        <Container style={{ textAlign: 'left' }}>
            {/* Card One */}
            <div className="card mb-3" >
                <div className="row g-0">
                    <div className="col" style={{width:269}}>
                        <img src="images/attack.png" className="img-fluid rounded-start" alt="Attack on Titan Manga Cover" style={{ width: 269, height: 300 }} />
                    </div>
                    <div className="col">
                        <div className="card-body">
                            <h5 className="card-title">Attack on Titan</h5>
                            <p className="card-text">Several hundred years ago, humans were nearly exterminated by titans.</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Card Two */}
            <div className="card mb-3" style={{ maxWidth: '540px' }}>
                <div className="row g-0">
                    <div className="col">
                        <img src="images/chainsaw.jpeg" className="img-fluid rounded-start" alt="Chainsaw Man Manga Cover" style={{ width: 269, height: 300 }} />
                    </div>
                    <div className="col">
                        <div className="card-body">
                            <h5 className="card-title">Chainsaw Man</h5>
                            <p className="card-text">The story is set in a world where Devils cause harm to humans, which makes them a target for extermination.</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Card Three */}
            <div className="card mb-3" style={{ maxWidth: '540px' }}>
                <div className="row g-0">
                    <div className="col">
                        <img src="images/jjk.jpg" className="img-fluid rounded-start" alt="Jujutsu Kaisen Manga Cover" />
                    </div>
                    <div className="col">
                        <div className="card-body">
                            <h5 className="card-title">Jujutsu Kaisen</h5>
                            <p className="card-text">Yuuji is a genius at track and field. But he has zero interest running around in circles, he’s happy as a clam in the Occult Research Club. Although he’s only in the club for kicks, things get serious when a real spirit shows up at school!</p>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
}

export default Home;