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
import {Button, Container, Nav, Navbar} from "react-bootstrap";
import EventCalendar from "./component/calendar/EventCalendar";
import ProjectDetails from "./component/projects/ProjectDetails";
import ProjectRecordingForm from "./component/projects/ProjectRecordingForm";
import TaskRecordForm from "./component/tasks/TaskRecordForm";

function App() {
  return (
      <Router>
          <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
              <Container fluid>
                  <Navbar.Brand href="/">MicroProject</Navbar.Brand>
                  <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                  <Navbar.Collapse id="responsive-navbar-nav">
                      <Nav className="me-auto">
                          <Nav.Link href="/">Home</Nav.Link>
                          <Nav.Link href="/projects">Projects</Nav.Link>
                          <Nav.Link href="/calendar">Calendar</Nav.Link>
                          <Nav.Link href="/profile">Profile</Nav.Link>
                      </Nav>
                  </Navbar.Collapse>
                  <Button>Login</Button>
              </Container>
          </Navbar>

          <Switch>
              <Route path="/calendar">
                  <EventCalendar/>
              </Route>
              <Route exact path="/projects">
                  <ProjectList />
              </Route>
              <Route path="/projects/project/:id" component={ProjectDetails}/>
              <Route path="/projects/new" component={ProjectRecordingForm}/>
              <Route path="/profile">
                  <Profile />
              </Route>
              <Route path="/tasks/add" render={(props) => <TaskRecordForm {...props}/>}/>
              <Route path="/">
                  <Welcome />
              </Route>
          </Switch>
      </Router>
  );
}

export default App;
