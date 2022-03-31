import {Button, Container, Form, Stack} from "react-bootstrap";
import React from "react";
import {Redirect} from "react-router-dom";
import {createTask} from "../../action/Tasks";
import sessionStore from "../../store/impl/SessionStore";
import dispatcher from "../../dispatcher/Dispatcher";
import {changeRedirectUri} from "../../dispatcher/SessionActionConstants";
import PropTypes from "prop-types";

class TaskRecordForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            projectId: this.props.match.params.id,
            title: "",
            description: "",
            redirect: null,
            submitDisabled: true,
            isUserLoggedIn: sessionStore._isUserLoggedIn
        };

        this._updateSessionStateFromStore = this._updateSessionStateFromStore.bind(this);
    }

    componentDidMount() {
        sessionStore.addChangeListener(this._updateSessionStateFromStore);
        if (!this.state.isUserLoggedIn) {
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: "/tasks/add"
            });
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
    }

    _updateSessionStateFromStore() {
        this.setState({
            isUserLoggedIn: sessionStore._isUserLoggedIn
        });
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
        createTask(this.state.projectId, this.state.title, this.state.description);
        this._returnToProject();
    }

    _returnToProject = () => {
        this.setState({redirect: `/projects/project/${this.state.projectId}`});
    }

    render() {
        if (!this.state.isUserLoggedIn)
            return (<Redirect to={"/login"}/>);
        if (this.state.redirect !== null)
            return (<Redirect to={this.state.redirect}/>);
        // TODO: add multiselect for assignees
        return (
            <Container>
                <h2>Add new task</h2>
                <Stack>
                    <Form.Label>Task title</Form.Label>
                    <Form.Control placeholder={'Title'} onChange={this._onTitleChange}/>
                    <Form.Label>Task description</Form.Label>
                    <Form.Control as={'textarea'} placeholder={'Description'} onChange={this._onDescChange}/>
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