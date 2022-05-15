import {Button, Container, Nav, Navbar} from "react-bootstrap";
import React, {useEffect, useState} from "react";
//import {useHistory} from "react-router-dom";
import sessionStore from "../store/impl/SessionStore";
import {logout, retrieveToken, signIn} from "../action/Users";
//import Keycloak from "keycloak-js";

const MainNavBar = () => {
    //const history = useHistory();
    const [isLoggedIn, setIsLoggedIn] = useState(sessionStore._isUserLoggedIn);

    const onLogIn = () => {
        console.log("log in");
//        window.location.href = 'http://localhost:5000/keycloak/realms/project_manager_realm/protocol/openid-connect/auth' +
//            '?client_id=microproject-app&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2F&response_mode=fragment&response_type=code&scope=openid';
        signIn();
    };

    const onLogOut = () => {
        console.log("log out");
        logout();
    };

    const updateSessionState = () => {
        setIsLoggedIn(sessionStore._isUserLoggedIn);
    };

    useEffect(() => {
       sessionStore.addChangeListener(updateSessionState);
        let i = window.location.href.indexOf('code');
        if(!isLoggedIn && i !== -1) {
            retrieveToken(window.location.href.substring(i + 5));
        }
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