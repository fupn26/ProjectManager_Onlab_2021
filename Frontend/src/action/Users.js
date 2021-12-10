import axios from "axios";
import {loginFailed, loginSuccess} from "../dispatcher/UserActionConstants";
import dispatcher from "../dispatcher/Dispatcher";

export function signIn(username, password) {
    axios.put('api/v1/user/signin', {
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