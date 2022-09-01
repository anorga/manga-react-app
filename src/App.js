import './App.css';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Attack from './components/Attack';
import Chainsaw from './components/Chainsaw';
import Jujutsu from './components/Jujutsu';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/attack" element={<Attack />} />
        <Route path="/chainsaw" element={<Chainsaw />} />
        <Route path="/jujutsu" element={<Jujutsu />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
