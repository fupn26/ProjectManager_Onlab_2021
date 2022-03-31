import axios from 'axios';
import dispatcher from '../dispatcher/Dispatcher';
import {addTask, changeTaskStatus, refreshTasks} from "../dispatcher/TaskActionConstants";
import logger from "../logger/Logger";

export function createTask(projectId, title, description) {
    axios.post('/api/v1/todo', {
        projectId: projectId,
        title: title,
        description: description
    }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    })
        .then(response => dispatcher.dispatch({
            action: addTask,
            payload: response.data
        }))
        .catch(error => logger.error(error));
}

export function getTasks(projectId) {
    axios.get('/api/v1/todo', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        params: {
            projectId: projectId
        }
    })
        .then(response => dispatcher.dispatch({
            action: refreshTasks,
            payload: response.data
        }))
        .catch(error => logger.error(error));
}

export function changeStatus(taskId, status) {
    axios.patch(`/api/v1/todo/${taskId}/status/${status}`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    })
        .then(() => dispatcher.dispatch({
            action: changeTaskStatus,
            payload: null
        }))
        .catch(error => logger.error(error));
}