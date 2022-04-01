import axios from "axios";
import logger from "../logger/Logger";
import dispatcher from "../dispatcher/Dispatcher";
import {meetingCreated, meetingListArrived} from "../dispatcher/MeetingActionConstants";

export function createMeeting({projectId, theme, startTime, endTime, place, participants}) {
    logger.info('Creating meeting...');
    const dataToSend = {
        projectId: projectId,
        theme: theme,
        startTime: startTime,
        endTime: endTime,
        place: place,
        participants: participants
    };

    axios.post('/api/v1/meeting', dataToSend, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    }).then(response => dispatcher.dispatch({
        action: meetingCreated,
        payload: response.data
    }))
        .catch(error => logger.error(error));
}

export function getMeetings() {
    logger.info('Getting meetings...');
    axios.get('/api/v1/meeting', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    })
        .then(response => dispatcher.dispatch({
            action: meetingListArrived,
            payload: response.data
        }))
        .catch(error => logger.error(error));
}