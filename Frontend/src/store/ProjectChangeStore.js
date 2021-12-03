import {EventEmitter} from "events";
import dispatcher from "../dispatcher/Dispatcher";
import * as actions from "../dispatcher/ProjectActionConstants";

class ProjectChangeStore extends EventEmitter {
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

const store = new ProjectChangeStore();
export default store;

dispatcher.register(({action})=>{
    if(action !== actions.projectChanged ) return;
    store.emitChange();
});