import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Home from './components/Home';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Header></Header>
      <Home />
      <Footer></Footer>
    </div>
  );
}

export default App;
