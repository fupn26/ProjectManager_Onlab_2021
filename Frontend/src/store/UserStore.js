import {EventEmitter} from "events";
import dispatcher from "../dispatcher/Dispatcher";
import * as actions from "../dispatcher/UserActionConstants";

class UserStore extends EventEmitter {
    _users = [];

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

const store = new UserStore();
export default store;

dispatcher.register(({action, payload})=>{
    if (action === actions.userListArrived) {
        store._users = payload;
        store.emitChange();
    }
});