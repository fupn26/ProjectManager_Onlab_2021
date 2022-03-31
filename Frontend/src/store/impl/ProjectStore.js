import dispatcher from "../../dispatcher/Dispatcher";
import * as actions from '../../dispatcher/ProjectActionConstants';
import BaseStore from "../BaseStore";

class ProjectStore extends BaseStore{
    _projects = [];
    _currentProject = null;
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
