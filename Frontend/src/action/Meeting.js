import axios from "axios";
import logger from "../logger/Logger";
import dispatcher from "../dispatcher/Dispatcher";
import {meetingListArrived} from "../dispatcher/MeetingActionConstants";

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