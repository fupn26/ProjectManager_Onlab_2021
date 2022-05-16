import axios from "axios";
import {
    loginSuccess,
    registerFailed,
    registerSuccess
} from "../dispatcher/SessionActionConstants";
import dispatcher from "../dispatcher/Dispatcher";
import {userListArrived, usernameArrived} from "../dispatcher/UserActionConstants";
import logger from "../logger/Logger";
import Cookies from "js-cookie";
//import Keycloak from "keycloak-js";

/*let initOptions = {
    url: 'http://localhost:5000/keycloak/', realm: 'project_manager_realm', clientId: 'microproject-app', onLoad: 'login-required'
};
const keycloak = new Keycloak(initOptions);
keycloak.onAuthSuccess = () => {
    console.log("Keycloak is ready");
    console.log('authenticated');
    localStorage.setItem("access_token", keycloak.token);
    dispatcher.dispatch({
        action: loginSuccess
    });
};

keycloak.onAuthError = () => {
    logger.error('Failed to sign in');
    dispatcher.dispatch({
        action: loginFailed
    });
};*/

const clientId = 'microproject-app';
let interval;

export function signIn() {
/*    keycloak.init({onLoad: initOptions.onLoad, checkLoginIframe: false}).catch(function() {
        alert('failed to initialize');
    });
 */
    window.location.href = `http://localhost:5000/keycloak/realms/project_manager_realm/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${window.location.origin}&response_mode=fragment&response_type=code&scope=openid`;
}

export function retrieveToken(authorizationCode) {
    let params = new URLSearchParams();
    params.append('grant_type','authorization_code');
    params.append('client_id', clientId);
    params.append('client_secret', 'newClientSecret');
    params.append('redirect_uri', window.location.origin);
    params.append('code',authorizationCode);

    axios.post('/keycloak/realms/project_manager_realm/protocol/openid-connect/token', params, {
        headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
    }).then(response => {
            Cookies.set("access_token", response.data.access_token, {
                expires: getExpireDate(response.data.expires_in)
            });
            Cookies.set("refresh_token", response.data.refresh_token, {
                expires: getExpireDate(response.data.refresh_expires_in)
            });
            Cookies.set("id_token", response.data.id_token);
            interval = setInterval(intervalFunction, 1000 * response.data.expires_in);
            dispatcher.dispatch({
                action: loginSuccess
            });
        })
        .catch(error => logger.error(error));
}

function refreshToken() {
    let params = new URLSearchParams();
    params.append('grant_type','refresh_token');
    params.append('client_id', clientId);
    params.append('refresh_token', Cookies.get('refresh_token'));

    axios.post('/keycloak/realms/project_manager_realm/protocol/openid-connect/token', params, {
        headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
    })
        .then(response => {
            Cookies.set("access_token", response.data.access_token, {
                expires: getExpireDate(response.data.expires_in)
            });
            Cookies.set("refresh_token", response.data.refresh_token, {
                expires: getExpireDate(response.data.refresh_expires_in)
            });
            Cookies.set("id_token", response.data.id_token);
            clearInterval(interval);
            interval = setInterval(intervalFunction, 1000 * response.data.expires_in);
        }).catch(error => logger.error(error));
}

function intervalFunction() {
    if (Cookies.get('refresh_token') != null) {
        refreshToken();
    } else {
        clearInterval(interval);
        logout();
    }
}

function getExpireDate(milliseconds) {
    const date = new Date();
    date.setTime(date.getTime() + (1000 * milliseconds));
    return date;
}

export function getUsers() {
    axios.get('/api/v1/user', {
        headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`
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

export function getUserInfo() {
    axios.get('/keycloak/realms/project_manager_realm/protocol/openid-connect/userinfo', {
        headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`
        }
    }).then(response => dispatcher.dispatch({
        action: usernameArrived,
        payload: response.data
    })).catch(error => logger.error(error));
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

export function logout() {
    window.location.href = 'http://localhost:5000/keycloak/realms/project_manager_realm/protocol/openid-connect/logout?post_logout_redirect_uri=' + window.location.origin +
    '&id_token_hint=' + Cookies.get('id_token');
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('id_token');
}