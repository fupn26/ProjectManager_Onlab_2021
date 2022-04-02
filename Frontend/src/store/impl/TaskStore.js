import dispatcher from "../../dispatcher/Dispatcher";
import * as actions from "../../dispatcher/TaskActionConstants";
import BaseStore from "../BaseStore";
import logger from "../../logger/Logger";

class TaskStore extends BaseStore {

    _tasks = [];

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

const constantArrayMapping = {
    TODO: 'toDos',
    DOING: 'doings',
    DONE: 'dones'
};

dispatcher.register(({action,payload})=>{
    if (action === actions.addTask) {
        console.log(`${payload.id} task created`);
        store._tasks.push(payload);
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
        store.emitChange();
    }
    else if (action === actions.changeTaskStatus) {
        const taskId = payload.taskId;
        const status = payload.status;
        const tasks = [...store._tasks.doings, ...store._tasks.dones, ...store._tasks.toDos];
        const task = tasks.find(task => task.id === taskId);
        if (task != null) {
            logger.info(`From: ${task.status} To: ${status.toUpperCase()}`);
            store._tasks[constantArrayMapping[task.status]] = store._tasks[constantArrayMapping[task.status]]
                .filter(task => task.id !== taskId);
            task.status = status.toUpperCase();
            store._tasks[constantArrayMapping[status.toUpperCase()]].push(task);
            console.log(store._tasks);
        }
       store.emitChange();
    }
    else if (action === actions.removeTask) {
        const tasks = [...store._tasks.doings, ...store._tasks.dones, ...store._tasks.toDos];
        const taskId = payload;
        const task = tasks.find(task => task.id === taskId);
        if (task != null)
            store._tasks[constantArrayMapping[task.status]] = store._tasks[constantArrayMapping[task.status]]
                .filter(task => task.id !== taskId);
        store.emitChange();
    }
});
