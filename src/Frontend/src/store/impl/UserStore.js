import dispatcher from "../../dispatcher/Dispatcher";
import * as actions from "../../dispatcher/UserActionConstants";
import BaseStore from "../BaseStore";

class UserStore extends BaseStore {
    _users = [];
    _current_username = '';
}

const store = new UserStore();
export default store;

dispatcher.register(({action, payload})=>{
    if (action === actions.userListArrived) {
        store._users = payload;
        store.emitChange();
    } else if (action === actions.usernameArrived) {
        store._current_username = payload;
        store.emitChange();
    }
});