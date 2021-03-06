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
import EventCalendar from "./component/calendar/EventCalendar";
import ProjectDetails from "./component/projects/ProjectDetails";
import ProjectRecordingForm from "./component/projects/ProjectRecordingForm";
import TaskRecordForm from "./component/tasks/TaskRecordForm";
//import LoginForm from "./component/users/LoginForm";
import MainNavBar from "./component/MainNavBar";
import ProjectUpdateForm from "./component/projects/ProjectUpdateForm";
import RegisterForm from "./component/users/RegisterForm";
import TaskDetails from "./component/tasks/TaskDetails";
import {signIn} from "./action/Users";

const App = () => {
    return (
        <Router>
            <MainNavBar/>
            <Switch>
                <Route path="/calendar">
                    <EventCalendar/>
                </Route>
                <Route exact path="/projects">
                    <ProjectList />
                </Route>
                <Route path="/projects/project/:id" component={ProjectDetails}/>
                <Route path="/projects/update/:id" component={ProjectUpdateForm}/>
                <Route path="/projects/new" component={ProjectRecordingForm}/>
                <Route path="/profile">
                    <Profile />
                </Route>
                <Route path="/tasks/add/:id" component={TaskRecordForm}/>
                <Route path="/tasks/:id" component={TaskDetails}/>
                <Route path="/login" component={() => {
                    signIn();
                    return null;
                }}/>
                <Route path="/register" component={RegisterForm}/>
                <Route path="/">
                    <Welcome />
                </Route>
            </Switch>
        </Router>
    );
};

export default App;
