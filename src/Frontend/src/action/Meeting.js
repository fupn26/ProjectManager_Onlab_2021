import axios from "axios";
import logger from "../logger/Logger";
import dispatcher from "../dispatcher/Dispatcher";
import {meetingCreated, meetingDeleted, meetingListArrived, meetingUpdated} from "../dispatcher/MeetingActionConstants";
import Cookies from "js-cookie";

export function createMeeting({projectId, theme, startTime, endTime, place, participants, notes}) {
    logger.info('Creating meeting...');
    const dataToSend = {
        projectId: projectId,
        theme: theme,
        startTime: startTime,
        endTime: endTime,
        place: place,
        participants: participants,
        notes: notes
    };

    axios.post('/api/v1/meeting', dataToSend, {
        headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`
        }
    }).then(response => dispatcher.dispatch({
        action: meetingCreated,
        payload: response.data
    }))
        .catch(error => logger.error(error));
}

export function updateMeeting(meetingId, {projectId, theme, startTime, endTime, place, participants, notes}) {
    logger.info('Updating meeting...');
    const dataToSend = {
        projectId: projectId,
        theme: theme,
        startTime: startTime,
        endTime: endTime,
        place: place,
        participants: participants,
        notes: notes
    };

    axios.put(`/api/v1/meeting/${meetingId}`, dataToSend, {
        headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`
        }
    }).then(() => dispatcher.dispatch({
        action: meetingUpdated,
        payload: {
            ...dataToSend,
            id: meetingId
        }
    }))
        .catch(error => logger.log(error));
}

export function getMeetings() {
    logger.info('Getting meetings...');
    axios.get('/api/v1/meeting', {
        headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`
        }
    })
        .then(response => dispatcher.dispatch({
            action: meetingListArrived,
            payload: response.data
        }))
        .catch(error => logger.error(error));
}

export function deleteMeeting(meetingId) {
    logger.info(`Deleting meeting: ${meetingId}`);
    axios.delete(`/api/v1/meeting/${meetingId}`, {
        headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`
        }
    }).then(() => dispatcher.dispatch({
        action: meetingDeleted,
        payload: meetingId
    }))
        .catch(error => logger.error(error));
}