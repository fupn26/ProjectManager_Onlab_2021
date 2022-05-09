import dispatcher from "../../dispatcher/Dispatcher";
import * as actions from "../../dispatcher/UserActionConstants";
import BaseStore from "../BaseStore";

class UserStore extends BaseStore {
    _users = [];
}

const store = new UserStore();
export default store;

dispatcher.register(({action, payload})=>{
    if (action === actions.userListArrived) {
        store._users = payload;
        store.emitChange();
    }
});