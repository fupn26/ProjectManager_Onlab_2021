import axios from 'axios';
import dispatcher from '../dispatcher/Dispatcher';
import * as actionConstants from '../dispatcher/ProjectActionConstants';
import logger from "../logger/Logger";
import Cookies from "js-cookie";

const _recordProject = ({title}) => {
    axios.post('/api/v1/project', {title: title}, {
        headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`
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
           Authorization: `Bearer ${Cookies.get("access_token")}`
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
    axios.get(`/api/v1/project/${id}`, {
        headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`
        }
    })
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

const _updateProject = (id, title, members) => {
    axios.put('/api/v1/project', {
        id: id,
        title: title,
        members: members
    }, {
        headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`
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
            Authorization: `Bearer ${Cookies.get("access_token")}`
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