import axios from "axios";
import logger from "../logger/Logger";
import dispatcher from "../dispatcher/Dispatcher";
import {commentCreated, commentListFetched} from "../dispatcher/CommentActionConstants";

export function createComment({toDoId, content}) {
    axios.post('/api/v1/comment', {
        toDoId: toDoId,
        content: content
    }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    }).then(response => dispatcher.dispatch({
        action: commentCreated,
        payload: response.data
    }))
        .catch(error => logger.error(error));
}

export function getComments(toDoId) {
    axios.get(`/api/v1/comment/find?toDoId=${toDoId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    }).then(response => dispatcher.dispatch({
        action: commentListFetched,
        payload: response.data
    }))
        .catch(error => logger.error(error));
}

export function getComment(id) {
    axios.get(`/api/v1/comment${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    }).then(response => dispatcher.dispatch({
        action: commentListFetched,
        payload: response.data
    }))
        .catch(error => logger.error(error));
}