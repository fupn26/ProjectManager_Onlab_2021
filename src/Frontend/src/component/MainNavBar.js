import {Button, Container, DropdownButton, Nav, Navbar} from "react-bootstrap";
import React, {useEffect, useState} from "react";
//import {useHistory} from "react-router-dom";
import sessionStore from "../store/impl/SessionStore";
import {getUserInfo, logout, retrieveToken, signIn} from "../action/Users";
import userStore from "../store/impl/UserStore";
import DropdownItem from "react-bootstrap/DropdownItem";
//import Keycloak from "keycloak-js";

const MainNavBar = () => {
    //const history = useHistory();
    const [isLoggedIn, setIsLoggedIn] = useState(sessionStore._isUserLoggedIn);
    const [username, setUsername] = useState(userStore._current_user.username);

    const onLogIn = () => {
        console.log("log in");
        signIn();
    };

    const onLogOut = () => {
        console.log("log out");
        logout();
    };

    const updateSessionState = () => {
        setIsLoggedIn(sessionStore._isUserLoggedIn);
    };

    const updateUsername = () => {
        setUsername(userStore._current_user.username);
    };

    useEffect(() => {
       sessionStore.addChangeListener(updateSessionState);
       userStore.addChangeListener(updateUsername);
        let i = window.location.href.indexOf('code');
        if(!isLoggedIn && i !== -1) {
            retrieveToken(window.location.href.substring(i + 5));
        }
        if (isLoggedIn) {
            getUserInfo();
        }
       return function cleanup() {
           sessionStore.removeChangeListener(updateSessionState);
           userStore.removeChangeListener(updateUsername);
       };
    }, [isLoggedIn, username]);


    const LogoutButton = () => {
        if (isLoggedIn) {
            return (
              <DropdownButton title={username}>
                  <DropdownItem onClick={onLogOut}>Logout</DropdownItem>
              </DropdownButton>
            );
        } else {
            return (
                <Button onClick={onLogIn}>Login</Button>
            );
        }
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
                        {
                            //<!--<Nav.Link href="/profile">Profile</Nav.Link>--> <!--TODO: create profile page-->
                        }
                    </Nav>
                </Navbar.Collapse>
                <LogoutButton/>
            </Container>
        </Navbar>
    );
};

export default MainNavBar;