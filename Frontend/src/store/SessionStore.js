import {EventEmitter} from "events";
import dispatcher from "../dispatcher/Dispatcher";
import * as actions from "../dispatcher/UserActionConstants";

class SessionStore extends EventEmitter {
    _isUserLoggedIn = localStorage.getItem("token") != null;
    _isLoginError = false;
    _redirectToOnSuccess = "/projects";

    emitChange(){
        this.emit('Change');
    }

    addChangeListener(callback){
        this.addListener('Change',callback);
    }

    removeChangeListener(callback){
        this.removeListener('Change',callback);
    }
}

const store = new SessionStore();
export default store;

dispatcher.register(({action, payload})=>{
    if (action === actions.loginSuccess) {
        store._isLoginError = false;
        store._isUserLoggedIn = true;
        store.emitChange();
    }
    else if (action === actions.loginFailed) {
        store._isLoginError = true;
        store.emitChange();
    }
    else if (action === actions.logoutSuccess) {
        store._isUserLoggedIn = false;
        store.emitChange();
    }
    else if (action === actions.changeRedirectUri) {
        store._redirectToOnSuccess = payload;
        store.emitChange();
    }
});
