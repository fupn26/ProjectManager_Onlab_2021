import {EventEmitter} from "events";
import dispatcher from "../dispatcher/Dispatcher";
import * as actions from "../dispatcher/TaskActionConstants";

class TaskStore extends EventEmitter {

    _tasks = null;
    _currentTask = [];

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

const store = new TaskStore();
export default store;

dispatcher.register(({action,payload})=>{
    if (action === actions.addTask) {
        console.log(`${payload.id} task created`);
        store._currentTask = payload;
        store.emitChange();
    }
    else if (action === actions.refreshTasks) {
        const toDos = [];
        const doings = [];
        const dones = [];
        payload.forEach(element => {
            switch (element.status) {
                case "TODO":
                    toDos.push(element);
                    break;
                case "DOING":
                    doings.push(element);
                    break;
                case "DONE":
                    dones.push(element);
                    break;
            }
        });
        store._tasks = {
            toDos: toDos,
            doings: doings,
            dones: dones
        };
        console.log(store._tasks);
        store.emitChange();
    }
    else if (action === actions.changeTaskStatus) {
       store.emitChange();
    }
});
