import React from 'react';
import './App.scss';
import ProjectList from "./component/projects/ProjectsList";
import Welcome from "./component/Welcome";
import Profile from "./component/users/Profile";

import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import {Container, Nav, Navbar} from "react-bootstrap";
import EventCalendar from "./component/calendar/EventCalendar";
import ProjectDetails from "./component/projects/ProjectDetails";

function App() {
  return (
      <Router>
          <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
              <Container>
                  <Navbar.Brand href="/">PandaProject</Navbar.Brand>
                  <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                  <Navbar.Collapse id="responsive-navbar-nav">
                      <Nav className="me-auto">
                          <Nav.Link href="/">Home</Nav.Link>
                          <Nav.Link href="/projects">Projects</Nav.Link>
                          <Nav.Link href="/calendar">Calendar</Nav.Link>
                          <Nav.Link href="/profile">Profile</Nav.Link>
                      </Nav>
                  </Navbar.Collapse>
              </Container>
          </Navbar>

          <Switch>
              <Route path="/calendar">
                  <EventCalendar/>
              </Route>
              <Route exact path="/projects">
                  <ProjectList />
              </Route>
              <Route path="/projects/:id" component={ProjectDetails}/>
              <Route path="/profile">
                  <Profile />
              </Route>
              <Route path="/">
                  <Welcome />
              </Route>
          </Switch>
      </Router>
  );
}

export default App;
