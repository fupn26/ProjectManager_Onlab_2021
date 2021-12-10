import axios from "axios";
import {loginFailed, loginSuccess, registerFailed, registerSuccess} from "../dispatcher/SessionActionConstants";
import dispatcher from "../dispatcher/Dispatcher";
import {userListArrived} from "../dispatcher/UserActionConstants";
import winston from "winston";

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console()
    ]
});

export function signIn(username, password) {
    axios.put('/api/v1/user/signin', {
        username: username,
        password: password
    })
        .then(response => {
            localStorage.setItem("token", response.data.token);
            dispatcher.dispatch({
                action: loginSuccess
            });
        })
        .catch(() => dispatcher.dispatch({
            action: loginFailed
        }));
}

export function getUsers() {
    axios.get('/api/v1/user', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    })
        .then(response => {
            dispatcher.dispatch({
                action: userListArrived,
                payload: response.data
            });
        })
        .catch(error => {
            logger.error(error);
        });
}

export function registerUser(email, username, password) {
    axios.post('/api/v1/user/register', {
        email: email,
        username: username,
        password: password
    })
        .then(response => {
            dispatcher.dispatch({
                action: registerSuccess,
                payload: response.data
            });
        })
        .catch(() => {
            dispatcher.dispatch({
                action: registerFailed
            });
        });
}