import React from 'react';
import PropTypes from 'prop-types';
import * as actions from "../../action/Projects";
import store from "../../store/ProjectStore";
import TaskList from "../tasks/TaskList";
import {Container} from "react-bootstrap";

class ProjectDetails extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            project: null
        };
        this._updateStateFromStore = this._updateStateFromStore.bind(this);
    }

    componentDidMount() {
        console.log("project details component mounted");
        actions.fetchProjectWithId(this.props.match.params.id);
        store.addChangeListener(this._updateStateFromStore);
    }

    componentWillUnmount() {
        store.removeChangeListener(this._updateStateFromStore);
    }

    _updateStateFromStore(){
        console.log("project details update arrived");
        this.setState(() => ({project: store._currentProject}));
    }

    render() {
        if (this.state.project == null)
            return (
              <h2>
                  {`Can't load project ${this.props.match.params.id}`}
              </h2>
            );
        return (
            <Container>
                <h1>
                    {this.state.project.title}
                </h1>
                <TaskList projectid={this.props.match.params.id}/>
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