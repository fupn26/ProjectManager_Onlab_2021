import {Button, Container, Form, Stack} from "react-bootstrap";
import React from "react";
import {Redirect} from "react-router-dom";
import {createTask} from "../../action/Tasks";
import sessionStore from "../../store/impl/SessionStore";
import dispatcher from "../../dispatcher/Dispatcher";
import {changeRedirectUri} from "../../dispatcher/SessionActionConstants";
import PropTypes from "prop-types";
import UserAdd from "../users/UserAdd";
import projectStore from "../../store/impl/ProjectStore";
import {getUsers} from "../../action/Users";
import {fetchAllProjects} from "../../action/Projects";
import userStore from "../../store/impl/UserStore";

class TaskRecordForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            projectId: this.props.match.params.id,
            title: "",
            description: "",
            users: [],
            project: null,
            assignees: [],
            redirect: null,
            submitDisabled: true,
            isUserLoggedIn: sessionStore._isUserLoggedIn
        };
    }

    componentDidMount() {
        sessionStore.addChangeListener(this._updateSessionStateFromStore);
        projectStore.addChangeListener(this._onProjectListChange);
        userStore.addChangeListener(this._onUserListChanged);
        if (!this.state.isUserLoggedIn) {
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: "/tasks/add"
            });
        } else {
            fetchAllProjects();
        }
    }

    componentDidUpdate() {
        if (!this.state.isUserLoggedIn) {
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: "/tasks/add"
            });
        }
    }

    componentWillUnmount() {
        sessionStore.removeChangeListener(this._updateSessionStateFromStore);
        projectStore.removeChangeListener(this._onProjectListChange);
        userStore.removeChangeListener(this._onUserListChanged);
    }

    _updateSessionStateFromStore = () => {
        this.setState({
            isUserLoggedIn: sessionStore._isUserLoggedIn
        });
    }

    _onProjectListChange = () => {
        const project = projectStore._projects.find(project => project.id === this.state.projectId);
        if (project != null) {
            this.setState({
                project: project
            });
            getUsers();
        }
    }

    _onUserListChanged = () => {
        if (this.state.project != null) {
            this.setState({
                users: userStore._users/*.filter(user => this.state.project.members.includes(user.id))*/ //TODO: add only the members of the project
            });
        }
    }

    _onTitleChange = (event) => {
        this.setState({title: event.target.value});
        this._updateButtonAvailability();
    }

    _onDescChange = (event) => {
        this.setState({description: event.target.value});
        this._updateButtonAvailability();
    }

    _updateButtonAvailability = () => {
        this.setState({submitDisabled: this.state.title === "" || this.state.description === ""});
    }

    _onSubmit = () => {
        createTask(this.state.projectId, this.state.title, this.state.description, this.state.assignees);
        this._returnToProject();
    }

    _returnToProject = () => {
        this.setState({redirect: `/projects/project/${this.state.projectId}`});
    }

    _onMemberAdded = (userId) => {
        const members = this.state.assignees;
        members.push(userId);
        this.setState({
            assignees: members
        });
    }

    _onMemberDeleted = (userId) => {
        this.setState({
            assignees: this.state.assignees.filter(member => member !== userId)
        });
    }

    render() {
        if (!this.state.isUserLoggedIn)
            return (<Redirect to={"/login"}/>);
        if (this.state.redirect !== null)
            return (<Redirect to={this.state.redirect}/>);
        return (
            <Container>
                <h2>Add new task</h2>
                <Stack>
                    <Form.Label>Task title</Form.Label>
                    <Form.Control placeholder={'Title'} onChange={this._onTitleChange}/>
                    <Form.Label>Task description</Form.Label>
                    <Form.Control as={'textarea'} placeholder={'Description'} onChange={this._onDescChange}/>
                    <UserAdd users={this.state.users} members={[]} onMemberAdded={this._onMemberAdded}
                             onMemberDeleted={this._onMemberDeleted}/>
                    <Button disabled={this.state.submitDisabled} variant={"primary"} onClick={this._onSubmit}>Submit</Button>
                    <Button variant={"danger"} onClick={this._returnToProject}>Cancel</Button>
                </Stack>
            </Container>
        );
    }
}

TaskRecordForm.propTypes = {
    match: PropTypes.object,
    params: PropTypes.object,
    id: PropTypes.string
};

export default TaskRecordForm;