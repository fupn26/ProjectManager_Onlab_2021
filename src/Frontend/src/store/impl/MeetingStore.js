import BaseStore from "../BaseStore";
import {
    meetingCreated,
    meetingDeleted,
    meetingListArrived,
    meetingUpdated
} from "../../dispatcher/MeetingActionConstants";
import dispatcher from "../../dispatcher/Dispatcher";
import userStore from "./UserStore";

class MeetingStore extends BaseStore {
    _meetings = [];
}

const store = new MeetingStore();
export default store;

dispatcher.register(({action, payload}) => {
    if (action === meetingListArrived) {
        store._meetings = payload;
        console.log(payload);
        store.emitChange();
    }
    else if (action === meetingCreated) {
        store._meetings.push({
            ...payload,
            creatorId: userStore._current_username
        });
        store.emitChange();
    }
    else if (action === meetingUpdated) {
        const meetingIndex = store._meetings.findIndex(meeting => meeting.id === payload.id);
        if (meetingIndex >= 0)
            store._meetings[meetingIndex] = {
                ...payload,
                creatorId: userStore._current_username
            };
    }
    else if (action === meetingDeleted) {
        store._meetings = store._meetings.filter(meeting => meeting.id !== payload);
        store.emitChange();
    }
});