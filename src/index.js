import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Attack from './components/Attack';
import Chainsaw from './components/Chainsaw';
import Jujutsu from './components/Jujutsu';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Header />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/attack" component={Attack} />
        <Route exact path="/chainsaw" component={Chainsaw} />
        <Route exact path="/jujutsu" component={Jujutsu} />
        <Route path="*">
          <Redirect to="/" />
        </Route>

      </Switch>
      <Footer />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

