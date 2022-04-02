import BaseStore from "../BaseStore";
import dispatcher from "../../dispatcher/Dispatcher";
import {commentCreated, commentListFetched} from "../../dispatcher/CommentActionConstants";

class CommentStore extends BaseStore {
    _comments = []
}

const store = new CommentStore();
export default store;

dispatcher.register(({action, payload}) => {
    if (action === commentCreated) {
        store._comments.push(payload);
        store.emitChange();
    }
    else if (action === commentListFetched) {
        store._comments = payload;
        store.emitChange();
    }
});