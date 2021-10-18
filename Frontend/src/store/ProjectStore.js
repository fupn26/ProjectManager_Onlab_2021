import {EventEmitter} from 'events';
import dispatcher from "../dispatcher/Dispatcher";
import * as actions from '../dispatcher/ProjectActionConstants';

class ProjectStore extends EventEmitter{

    _projects = [];

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

const store = new ProjectStore();
export default store;

dispatcher.register(({action,payload})=>{
    if(action !== actions.refreshProjects ) return;
    store._projects = payload;
    store.emitChange();
});
