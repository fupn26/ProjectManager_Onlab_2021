import React from "react";
import PropTypes from "prop-types";
import sessionStore from "../../store/impl/SessionStore";
import projectStore from "../../store/impl/ProjectStore";
import userStore from "../../store/impl/UserStore";
import dispatcher from "../../dispatcher/Dispatcher";
import {changeRedirectUri} from "../../dispatcher/SessionActionConstants";
import {Redirect} from "react-router-dom";
import {getUsers} from "../../action/Users";
import {fetchProjectWithId, updateProject} from "../../action/Projects";
import {Button, Container, FormControl, FormLabel, FormSelect, ListGroup, ListGroupItem} from "react-bootstrap";

class ProjectUpdateForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projectId: this.props.match.params.id,
            project: projectStore._currentProject,
            users: userStore._users,
            isUserLoggedIn: sessionStore._isUserLoggedIn,
            optionPlaceholderText: "Select a user to add...",
            redirect: false
        };
        this._updateSessionStateFromStore = this._updateSessionStateFromStore.bind(this);
        this._updateProjectFromStore = this._updateProjectFromStore.bind(this);
        this._updateUsersFromStore = this._updateUsersFromStore.bind(this);
        this._mapToUserName = this._mapToUserName.bind(this);
        this._isUserCanBeAdded = this._isUserCanBeAdded.bind(this);
        this._onSelectChange = this._onSelectChange.bind(this);
        this._onDeleteFromMembers = this._onDeleteFromMembers.bind(this);
        this._onSave = this._onSave.bind(this);
        this._onCancel = this._onCancel.bind(this);
        this._onTitleChange = this._onTitleChange.bind(this);
    }

    componentDidMount() {
        if (!this.state.isUserLoggedIn) {
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: `/projects/update/${this.state.projectId}`
            });
        }
        getUsers();
        fetchProjectWithId(this.state.projectId);
        sessionStore.addChangeListener(this._updateSessionStateFromStore);
        projectStore.addChangeListener(this._updateProjectFromStore);
        userStore.addChangeListener(this._updateUsersFromStore);
    }

    componentWillUnmount() {
        sessionStore.removeChangeListener(this._updateSessionStateFromStore);
        projectStore.removeChangeListener(this._updateProjectFromStore);
        userStore.removeChangeListener(this._updateUsersFromStore);
    }

    _updateSessionStateFromStore() {
        this.setState({
            isUserLoggedIn: sessionStore._isUserLoggedIn
        });
    }

    _updateProjectFromStore() {
        this.setState({
            project: projectStore._currentProject
        });
    }

    _updateUsersFromStore() {
        this.setState({
            users: userStore._users
        });
    }

    _mapToUserName(userId) {
        if (this.state.users == null)
            return "Unknown";
        else {
            const user = this.state.users.find(element => element.id === userId);
            if (user == null) {
                return "Unknown";
            }
            return user.username;
        }
    }

    _isUserCanBeAdded(user) {
        return user.id !== this.state.project.owner //user is not owner
            && this.state.project.members.find(member => member === user.id) === undefined; //user is not among the members
    }

    _onTitleChange(event) {
        const project = this.state.project;
        project.title = event.target.value;
        this.setState({
            project: project
        });
    }

    _onSelectChange(event) {
        if (event.target.value !== this.state.optionPlaceholderText) {
            const project = this.state.project;
            project.members.push(event.target.value);
            this.setState({
                project: project
            });
        }
    }

    _onDeleteFromMembers(userId) {
        const project = this.state.project;
        project.members = project.members.filter(member => member !== userId);
        this.setState({
            project: project
        });
    }

    _onSave() {
        const project = this.state.project;
        updateProject(project.id, project.title, project.members);
        this.setState({
            redirect: true
        });
    }

    _onCancel() {
        this.setState({
            redirect: true
        });
    }

    render() {
        if (!this.state.isUserLoggedIn) {
            return (<Redirect to={"/login"}/>);
        }

        if (this.state.redirect)
            return (<Redirect to={"/projects"}/>);

        if (this.state.project == null) {
            return (<h2>{`Can't load project ${this.state.projectId}`}</h2>);
        }

        return (
            <Container>
                <FormLabel>Project title</FormLabel>
                <FormControl value={this.state.project.title} onChange={this._onTitleChange}/>
                <FormLabel>Members</FormLabel>
                <ListGroup>
                    <ListGroupItem>{this._mapToUserName(this.state.project.owner)}</ListGroupItem>
                    {
                        this.state.project.members.map(member => (
                            <ListGroupItem key={member}>
                                <div className={"d-flex justify-content-between"}>
                                    <div>{this._mapToUserName(member)}</div>
                                    <div>
                                        <Button variant={"danger"}
                                                onClick={() => this._onDeleteFromMembers(member)}>Delete</Button>
                                    </div>
                                </div>
                            </ListGroupItem>
                        ))
                    }
                </ListGroup>
                <FormLabel>Add new members</FormLabel>
                <div>
                    <FormSelect style={{
                        width: "100%"
                    }} onChange={this._onSelectChange}>
                        <option value={this.state.optionPlaceholderText}>{this.state.optionPlaceholderText}</option>
                        {
                            this.state.users.filter(this._isUserCanBeAdded).map(user => {
                                return (
                                    <option key={user.id} value={user.id}>{user.username}</option>
                                );
                            })
                        }
                    </FormSelect>
                </div>
                <div className={"d-flex justify-content-end"} style={{
                    paddingTop: "1em",
                    width: "100%"
                }}>
                    <Button variant={"success"} style={{
                        marginRight: "1em"
                    }} onClick={this._onSave}>Save</Button>
                    <Button variant={"danger"} onClick={this._onCancel}>Cancel</Button>
                </div>
            </Container>
        );
    }
}

ProjectUpdateForm.propTypes = {
    match: PropTypes.object,
    params: PropTypes.object,
    id: PropTypes.string
};

export default ProjectUpdateForm;