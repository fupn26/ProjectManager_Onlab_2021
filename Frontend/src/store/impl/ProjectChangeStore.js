import dispatcher from "../../dispatcher/Dispatcher";
import * as actions from "../../dispatcher/ProjectActionConstants";
import BaseStore from "../BaseStore";

class ProjectChangeStore extends BaseStore {
}

const store = new ProjectChangeStore();
export default store;

dispatcher.register(({action})=>{
    if(action !== actions.projectChanged ) return;
    store.emitChange();
});