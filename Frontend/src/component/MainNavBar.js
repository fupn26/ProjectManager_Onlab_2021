import {Button, Container, Nav, Navbar} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import dispatcher from "../dispatcher/Dispatcher";
import {logoutSuccess} from "../dispatcher/SessionActionConstants";
import sessionStore from "../store/impl/SessionStore";

const MainNavBar = () => {
    const history = useHistory();
    const [isLoggedIn, setIsLoggedIn] = useState(sessionStore._isUserLoggedIn);

    const onLogIn = () => {
        console.log("log in");
        history.push("/login");
    };

    const onLogOut = () => {
        console.log("log out");
        localStorage.removeItem("token");
        dispatcher.dispatch({
            action: logoutSuccess
        });
        history.push("/");
    };

    const updateSessionState = () => {
        setIsLoggedIn(sessionStore._isUserLoggedIn);
    };

    useEffect(() => {
       sessionStore.addChangeListener(updateSessionState);
       return function cleanup() {
           sessionStore.removeChangeListener(updateSessionState);
       };
    }, [isLoggedIn]);


    const LogoutButton = () => {
        return isLoggedIn ? (<Button onClick={onLogOut}>Logout</Button>)
            : (<Button onClick={onLogIn}>Login</Button>);
    };

    return (
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
                <LogoutButton/>
            </Container>
        </Navbar>
    );
};

export default MainNavBar;