import BaseStore from "../BaseStore";
import {meetingCreated, meetingListArrived} from "../../dispatcher/MeetingActionConstants";
import dispatcher from "../../dispatcher/Dispatcher";

class MeetingStore extends BaseStore {
    _meetings = null;
}

const store = new MeetingStore();
export default store;

dispatcher.register(({action, payload}) => {
    if (action === meetingListArrived) {
        store._meetings = payload;
        store.emitChange();
    }
    else if (action === meetingCreated) {
        store._meetings.push(payload);
        store.emitChange();
    }
});