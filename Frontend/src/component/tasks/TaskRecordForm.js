import {Button, Container, Form, Stack} from "react-bootstrap";
import React from "react";
import PropTypes from "prop-types";
import {Redirect} from "react-router-dom";
import {createTask} from "../../action/Tasks";
import store from "../../store/ProjectStore";

class TaskRecordForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            projectId: null,
            title: "",
            description: "",
            redirect: null,
            submitDisabled: true
        };
    }

    componentDidMount() {
        if (store._currentProject == null)
            this.setState({redirect: '/projects'});
        else
            this.setState({projectId: store._currentProject.id});
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
    location: PropTypes.object,
    state: PropTypes.object
};

export default TaskRecordForm;