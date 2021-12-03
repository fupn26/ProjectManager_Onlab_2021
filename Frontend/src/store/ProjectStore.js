import {EventEmitter} from 'events';
import dispatcher from "../dispatcher/Dispatcher";
import * as actions from '../dispatcher/ProjectActionConstants';

class ProjectStore extends EventEmitter{

    _projects = [];
    _currentProject = null;

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
    if(action === actions.refreshProjectDetails ) {
        console.log(`${payload.id} project update arrived to store`);
        store._currentProject = payload;
        store.emitChange();
    }
    else if(action === actions.refreshProjects ) {
        store._projects = payload;
        store.emitChange();
    }
});
