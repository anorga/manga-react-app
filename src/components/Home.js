import React from 'react';
import Container from 'react-bootstrap/Container';

function Home() {
    return (
        <Container style={{ textAlign: 'left' }}>
            {/* Card One */}
            <div className="card mb-3" style={{ maxWidth: '540px' }}>
                <div className="row g-0">
                    <div className="col">
                        <img src="images/attack.png" className="img-fluid rounded-start" alt="Attack on Titan logo" style={{ width: 269, height: 300 }} />
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
                        <img src="images/chainsaw.jpeg" className="img-fluid rounded-start" alt="..." style={{ width: 269, height: 300 }} />
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
                    <div className="col-md-4">
                        <img src="..." className="img-fluid rounded-start" alt="..." />
                    </div>
                    <div className="col-md-8">
                        <div className="card-body">
                            <h5 className="card-title">Card title</h5>
                            <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                            <p className="card-text"><small className="text-muted">Last updated 3 mins ago</small></p>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
}

export default Home;