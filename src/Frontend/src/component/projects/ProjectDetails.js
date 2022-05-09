import React from 'react';
import PropTypes from 'prop-types';
import * as actions from "../../action/Projects";
import store from "../../store/impl/ProjectStore";
import TaskList from "../tasks/TaskList";
import {Container} from "react-bootstrap";
import sessionStore from "../../store/impl/SessionStore";
import {Redirect} from "react-router-dom";
import dispatcher from "../../dispatcher/Dispatcher";
import {changeRedirectUri} from "../../dispatcher/SessionActionConstants";

class ProjectDetails extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            projectId: this.props.match.params.id,
            project: null,
            isUserLoggedIn: sessionStore._isUserLoggedIn
        };
        this._updateStateFromStore = this._updateStateFromStore.bind(this);
        this._updateSessionStateFromStore = this._updateSessionStateFromStore.bind(this);
    }

    componentDidMount() {
        console.log("project details component mounted");
        actions.fetchProjectWithId(this.state.projectId);
        store.addChangeListener(this._updateStateFromStore);
        sessionStore.addChangeListener(this._updateSessionStateFromStore);
        if (!this.state.isUserLoggedIn) {
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: `/projects/project/${this.state.projectId}`
            });
        }
    }

    componentDidUpdate() {
        if (!this.state.isUserLoggedIn) {
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: `/projects/project/${this.state.projectId}`
            });
        }
    }

    componentWillUnmount() {
        store.removeChangeListener(this._updateStateFromStore);
        sessionStore.removeChangeListener(this._updateSessionStateFromStore);
    }

    _updateStateFromStore(){
        console.log("project details update arrived");
        this.setState(() => ({project: store._currentProject}));
    }

    _updateSessionStateFromStore() {
        this.setState({
            isUserLoggedIn: sessionStore._isUserLoggedIn
        });
    }

    render() {
        if (!this.state.isUserLoggedIn) {
            return (<Redirect to={"/login"}/>);
        }
        if (this.state.project == null)
            return (
              <h2>
                  {`Can't load project ${this.state.projectId}`}
              </h2>
            );
        return (
            <Container>
                <h1>
                    {this.state.project.title}
                </h1>
                <TaskList projectid={this.state.projectId}/>
            </Container>
        );
    }
}

ProjectDetails.propTypes = {
    match: PropTypes.object,
    params: PropTypes.object,
    id: PropTypes.string
};

export default ProjectDetails;