import BaseStore from "../BaseStore";
import dispatcher from "../../dispatcher/Dispatcher";
import {commentCreated, commentFetched, commentListFetched} from "../../dispatcher/CommentActionConstants";

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
    else if (action === commentFetched) {
        const commentIndex = store._comments.findIndex(comment => comment.id === payload.id);
        if (commentIndex >= 0) {
            store._comments[commentIndex] = payload;
        }
        else {
            store._comments.push(payload);
        }
        store.emitChange();
    }
});