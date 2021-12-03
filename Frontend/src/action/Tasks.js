import axios from 'axios';
import dispatcher from '../dispatcher/Dispatcher';
import winston from 'winston';
import {addTask, changeTaskStatus, refreshTasks} from "../dispatcher/TaskActionConstants";

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console()
    ]
});

export function createTask(projectId, title, description) {
    axios.post('/api/v1/todo', {
        projectId: projectId,
        title: title,
        description: description
    })
        .then(response => dispatcher.dispatch({
            action: addTask,
            payload: response.data
        }))
        .catch(error => logger.error(error));
}

export function getTasks(projectId) {
    axios.get('/api/v1/todo', {
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
    axios.patch(`/api/v1/todo/${taskId}/status/${status}`)
        .then(() => dispatcher.dispatch({
            action: changeTaskStatus,
            payload: null
        }))
        .catch(error => logger.error(error));
}