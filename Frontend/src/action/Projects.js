import axios from 'axios';
import dispatcher from '../dispatcher/Dispatcher';
import * as actionConstants from '../dispatcher/ProjectActionConstants';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console()
    ]
});

const _recordProject = ({title}) => {
    axios.post('/api/v1/project', {title: title}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    })
        .then(() => {
            dispatcher.dispatch({
                action: actionConstants.projectChanged,
                payload: null
            });
        })
        .catch(err => {
            logger.error(err);
        });
};

const _fetchAllProjects = () => {
   axios.get('/api/v1/project', {
       headers: {
           Authorization: `Bearer ${localStorage.getItem("token")}`
       }
   })
       .then(resp => {
           dispatcher.dispatch({
               action: actionConstants.refreshProjects,
               payload: resp.data
           });
       })
       .catch(err => {
           logger.error(err);
       });
};

const _fetchProjectWithId = (id) => {
    axios.get(`/api/v1/project/${id}`)
        .then(resp => {
            dispatcher.dispatch({
                action: actionConstants.refreshProjectDetails,
                payload: resp.data
            });
        })
        .catch(err => {
            logger.error(err);
        });
};

const _updateProject = (id, title) => {
    axios.put('/api/v1/project', {
        id: id,
        newTitle: title
    }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    }).then(() => {
        dispatcher.dispatch({
            action: actionConstants.projectChanged,
            payload: null
        });
    })
    .catch(err => {
        logger.error(err);
    });
};

const _deleteProject = (id) => {
    axios.delete(`/api/v1/project/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    })
        .then(() => {
            dispatcher.dispatch({
                action: actionConstants.projectChanged,
                payload: null
            });
        })
        .catch(err => {
            logger.error(err);
        });
};

export const recordProject = _recordProject;
export const fetchAllProjects = _fetchAllProjects;
export const fetchProjectWithId = _fetchProjectWithId;
export const updateProject = _updateProject;
export const deleteProject = _deleteProject;