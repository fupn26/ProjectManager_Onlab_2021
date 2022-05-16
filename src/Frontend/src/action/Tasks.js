import axios from 'axios';
import dispatcher from '../dispatcher/Dispatcher';
import {addTask, changeTaskStatus, refreshTasks, removeTask} from "../dispatcher/TaskActionConstants";
import logger from "../logger/Logger";
import Cookies from "js-cookie";

export function createTask(projectId, title, description, assignees) {
    axios.post('/api/v1/todo', {
        projectId: projectId,
        title: title,
        description: description,
        assignees: assignees
    }, {
        headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`
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
            Authorization: `Bearer ${Cookies.get("access_token")}`
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
            Authorization: `Bearer ${Cookies.get("access_token")}`
        }
    })
        .then(() => dispatcher.dispatch({
            action: changeTaskStatus,
            payload: {
                taskId: taskId,
                status: status
            }
        }))
        .catch(error => logger.error(error));
}

export function deleteTask(taskId) {
    axios.delete(`/api/v1/todo/${taskId}`, {
        headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`
        }
    }).then(() => dispatcher.dispatch({
        action: removeTask,
        payload: taskId
    }))
        .catch(error => logger.error(error));
}
