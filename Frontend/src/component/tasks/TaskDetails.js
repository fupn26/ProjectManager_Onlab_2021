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
            isUserLoggedIn: sessionStore._isUserLoggedIn
        };
    }

    componentDidMount() {
        sessionStore.addChangeListener(this._updateSessionStateFromStore);
        userStore.addChangeListener(this._onUserListChanged);
        taskStore.addChangeListener(this._onTaskListChanged);
        projectStore.addChangeListener(this._onProjectListChanged);
        if (!this.state.isUserLoggedIn) {
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: `/tasks/${this.state.taskId}`
            });
        } else {
            getUsers();
            getTasks();
        }
    }

    componentWillUnmount() {
        sessionStore.addChangeListener(this._updateSessionStateFromStore);
        userStore.removeChangeListener(this._onUserListChanged);
        taskStore.removeChangeListener(this._onTaskListChanged);
        projectStore.removeChangeListener(this._onProjectListChanged);
    }

    componentDidUpdate() {
        if (!this.state.isUserLoggedIn) {
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: `/tasks/${this.state.taskId}`
            });
        }
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
                    <div style={{
                        height: '95%',
                        overflowY: 'auto'
                    }}>

                    </div>
                    <div style={{
                        display: "flex"
                    }}>
                        <FormControl/>
                        <Button>Send</Button>
                    </div>
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