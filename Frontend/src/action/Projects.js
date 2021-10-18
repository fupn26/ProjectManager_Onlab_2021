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

const _fetchAllProjects = () => {
   axios.get('/api/v1/project')
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


export const fetchAllProjects = _fetchAllProjects;

