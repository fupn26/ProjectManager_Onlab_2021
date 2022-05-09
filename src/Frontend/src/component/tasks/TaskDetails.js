import React from "react";
import PropTypes from "prop-types";
import {Alert, Button, FormControl, Stack, Table} from "react-bootstrap";
import userStore from "../../store/impl/UserStore";
import taskStore from "../../store/impl/TaskStore";
import {getUsers} from "../../action/Users";
import {getTasks} from "../../action/Tasks";
import projectStore from "../../store/impl/ProjectStore";
import {fetchAllProjects} from "../../action/Projects";
import sessionStore from "../../store/impl/SessionStore";
import dispatcher from "../../dispatcher/Dispatcher";
import {changeRedirectUri} from "../../dispatcher/SessionActionConstants";
import {Redirect} from "react-router-dom";
import "react-chat-elements/dist/main.css";
import {MessageList} from "react-chat-elements";
import commentStore from "../../store/impl/CommentStore";
import jwtDecode from "jwt-decode";
import {createComment, getComments} from "../../action/Comments";
import * as signalR from "@microsoft/signalr";
import logger from "../../logger/Logger";

class SignalRHub {
    constructor(token, taskId) {
        this._hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("/commentHub", { accessTokenFactory: () => token})
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();
        this._hubConnection.onreconnecting(this._onReconnecting);
        this._hubConnection.onreconnected(this._onReconnected);
        this._hubConnection.on("ReceiveMessage", this._onReceiveMessage);
        this._taskId = taskId;
        this._startConnection();
    }

    _taskId = null;

    _onReconnecting = (error) => {
        logger.error(`Connection lost due to ${error}. Reconnecting...`);
    }

    _onReconnected = (connectionId) => {
        logger.info(`Connection established with connection id ${connectionId}`);
    }

    _onReceiveMessage = () => {
        logger.info('message received');
        getComments(this._taskId);
    }


    _startConnection = async () => {
        try {
            await this._hubConnection.start();
            console.assert(this._hubConnection.state === signalR.HubConnectionState.Connected);
            logger.info("SignalR Connected.");
        } catch (err) {
            logger.error('Can\'t connect to SignalR');
            setTimeout(() => this._startConnection(), 5000);
        }
    }

    invoke = async (methodName) => {
        await this._hubConnection.invoke(methodName);
    }

    stop = () => {
        this._hubConnection.stop().then(() => {
            logger.info("SignalR conection closed.");
        });
    }

    _hubConnection = null
}

class TaskDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            taskId: this.props.match.params.id,
            comments: [],
            task: null,
            project: null,
            taskNotExists: false,
            users: [],
            textStyle: {
                fontWeight: 'bold'
            },
            isUserLoggedIn: sessionStore._isUserLoggedIn,
            isCommentHubConnected: false
        };
    }

    componentDidMount() {
        sessionStore.addChangeListener(this._updateSessionStateFromStore);
        userStore.addChangeListener(this._onUserListChanged);
        taskStore.addChangeListener(this._onTaskListChanged);
        projectStore.addChangeListener(this._onProjectListChanged);
        commentStore.addChangeListener(this._onCommentListChanged);
        if (!this.state.isUserLoggedIn) {
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: `/tasks/${this.state.taskId}`
            });
        } else {
            logger.info(`Component mounting with task id: ${this.state.taskId}`);
            getUsers();
            getTasks();
            getComments(this.state.taskId);
            this._hubConnection = new SignalRHub(localStorage.getItem('token'), this.state.taskId);
        }
    }

    componentWillUnmount() {
        sessionStore.addChangeListener(this._updateSessionStateFromStore);
        userStore.removeChangeListener(this._onUserListChanged);
        taskStore.removeChangeListener(this._onTaskListChanged);
        projectStore.removeChangeListener(this._onProjectListChanged);
        commentStore.removeChangeListener(this._onCommentListChanged);
        this._hubConnection.stop();
    }

    componentDidUpdate() {
        if (!this.state.isUserLoggedIn) {
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: `/tasks/${this.state.taskId}`
            });
        }
    }

    _onCommentListChanged = () => {
        this.setState({
           comments: commentStore._comments
        });
    }

    _onUserListChanged = () => {
        this.setState({
            users: userStore._users
        });
    }

    _onTaskListChanged = () => {
        const tasks = [...taskStore._tasks.dones, ...taskStore._tasks.doings, ...taskStore._tasks.toDos];
        const task = tasks.find(task => task.id === this.state.taskId);
        if (task != null) {
            this.setState({
                task: task
            });
            fetchAllProjects();
        }
        else
            this.setState({
                taskNotExists: true
            });
    }

    _onProjectListChanged = () => {
        const project = projectStore._projects.find(project => project.id === this.state.task.projectId);
        if (project != null)
            this.setState({
                project: project
            });
    }

    _mapUserIdToName = (userId) => {
        const user = this.state.users.find(user => user.id === userId);
        if (user != null)
            return user.username;
        else
            return 'Unknown';
    }

    _updateSessionStateFromStore = () => {
        this.setState({
            isUserLoggedIn: sessionStore._isUserLoggedIn
        });
    }

    _mapToMessage = (comment) => {
        const user = this.state.users.find(user => user.id === comment.user);
        let title = 'Unknown';
        if (user != null)
            title = user.username;
        let position = 'left';
        if (jwtDecode(localStorage.getItem("token")).sub === comment.user)
            position = 'right';
        return {
            position: position,
            type: 'text',
            text: comment.content,
            title: title,
            date: new Date(comment.creationTime)
        };

    }

    _onSendComment = async () => {
        const content = document.getElementById('content_input').value;
        const comment = {
            toDoId: this.state.taskId,
            content: content
        };
        logger.info(this._hubConnection.state);
        createComment(comment);
    }

    _hubConnection = null;

    render() {
        if (!this.state.isUserLoggedIn)
            return (<Redirect to={"/login"}/>);
        if (this.state.taskNotExists)
            return (
              <div>
                  <Alert>{`Task not exists: ${this.state.taskId}`}</Alert>
              </div>
            );
        return (
            <div style={{
                width: '100%',
                height: '92vh',
                display: 'flex',
                flexFlow: 'row'
            }}>
                <Stack style={{
                    width: '30%',
                    height: '100%',
                }} gap={3}>
                    <div>
                        <h3>{this.state.task != null ? this.state.task.title : 'Task not available yet'}</h3>
                    </div>
                    {
                        (this.state.task != null) && <Table>
                            <tbody>
                                <tr>
                                    <td style={this.state.textStyle}>Project:</td>
                                    <td>{this.state.project != null ? this.state.project.title : 'Unknown'}</td>
                                </tr>
                                <tr>
                                    <td style={this.state.textStyle}>Description:</td>
                                    <td>{this.state.task.description}</td>
                                </tr>
                                <tr>
                                    <td style={this.state.textStyle}>Status:</td>
                                    <td>{this.state.task.status}</td>
                                </tr>
                                {
                                    this.state.task.assigneeIds.map((userId, index, array) => {
                                        if (index === 0)
                                            return (
                                                <tr key={userId}>
                                                    <td style={this.state.textStyle} rowSpan={array.length}>Assignees:</td>
                                                    <td>{this._mapUserIdToName(userId)}</td>
                                                </tr>
                                            );
                                        else
                                            return (
                                                <tr key={userId}>
                                                    <td>{this._mapUserIdToName(userId)}</td>
                                                </tr>
                                            );
                                    })
                                }
                            </tbody>
                        </Table>
                    }
                </Stack>
                <Stack style={{
                    width: '70%',
                    height: '100%',
                    backgroundColor: 'black'
                }}>
                    {
                        (this.state.task != null) && <>
                            <div style={{
                                height: '95%',
                                overflowY: 'auto',
                                color: 'black'
                            }}>
                                <MessageList
                                    lockable={true}
                                    toBottomHeight={'100%'}
                                    dataSource={this.state.comments.map(this._mapToMessage)}/>
                            </div>
                            <div style={{
                                display: "flex"
                            }}>
                                <FormControl id={'content_input'}/>
                                <Button onClick={this._onSendComment}>Send</Button>
                            </div>
                        </>
                    }
                </Stack>
            </div>
        );
    }
}

TaskDetails.propTypes = {
    match: PropTypes.object,
    params: PropTypes.object,
    id: PropTypes.string
};

export default TaskDetails;