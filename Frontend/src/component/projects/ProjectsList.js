import React from 'react';
import projectStore from '../../store/ProjectStore';
import projectChangedStore from '../../store/ProjectChangeStore';
import * as actions from '../../action/Projects';
import {Redirect} from "react-router-dom";
import {Container} from "react-bootstrap";

const redirectConstants = {
    projectRedirect: 'REDIRECT_TO_PROJECT',
    addRedirect: 'REDIRECT_TO_ADD_PROJECT',
    editRedirect: 'REDIRECT_TO_EDIT_PROJECT'
};

class ProjectsList extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            projects : [],
            redirect : {
                type: null,
                payload: null
            }
        };
        this._getAllProjectFromStore = this._getAllProjectFromStore.bind(this);
        this._handleProjectOnClick = this._handleProjectOnClick.bind(this);
        this._fetchProjects = this._fetchProjects.bind(this);
    }

    componentDidMount() {
        console.log("component mounted");
        this._fetchProjects();
        projectStore.addChangeListener(this._getAllProjectFromStore);
        projectChangedStore.addChangeListener(this._fetchProjects);
    }

    componentWillUnmount() {
        projectStore.removeChangeListener(this._getAllProjectFromStore);
        projectChangedStore.removeChangeListener(this._fetchProjects);
    }

    _fetchProjects() {
        actions.fetchAllProjects();
    }

    _handleProjectOnClick(id) {
        console.log("id changed");
        this.setState(() => ({
            redirect : {
                type: redirectConstants.projectRedirect,
                payload: id
            }
        }));
    }

    _handleAddOnClick() {
        console.log('add new project');
        this.setState(() => ({
            redirect : {
                type: redirectConstants.addRedirect,
                payload: null
            }
        }));
    }

    _handleEditOnClick(id) {
        console.log(`editing project ${id}`);
        this.setState(() => ({
            redirect: {
                type: redirectConstants.editRedirect,
                payload: id
            }
        }));
    }

    _getAllProjectFromStore(){
        this.setState(() => ({projects: projectStore._projects}));
    }

    render() {
        if (this.state.redirect.type === redirectConstants.projectRedirect)
            return (<Redirect push to={`/projects/project/${this.state.redirect.payload}`}/>);

        if (this.state.redirect.type === redirectConstants.addRedirect)
            return (<Redirect push to={`/projects/new`}/>);

        return (
            <Container>
                <div className={'d-flex justify-content-between'}>
                    <h1>
                        Your projects
                    </h1>
                    <button className={'btn btn-secondary'} onClick={this._handleAddOnClick.bind(this)}>
                        Create New Project
                    </button>
                </div>
                <table className="table table-hover">
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Owner</th>
                        <th className={'text-right'}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.projects.map(({id, title, owner}) => {
                            return (
                                <tr key={id} onClick={this._handleProjectOnClick.bind(this, id)}>
                                    <td>{title}</td>
                                    <td>{owner}</td>
                                    <td>
                                        <div className={'text-right'}>
                                            <button className={'btn btn-success'}
                                                    onClick={event => {
                                                        event.stopPropagation();
                                                        console.log(`editing project ${id}`);
                                                        this.setState(() => ({
                                                            redirect: {
                                                                type: redirectConstants.editRedirect,
                                                                payload: id
                                                            }
                                                        }));
                                                    }}>Edit</button>
                                            <button className={'btn btn-danger'}
                                                    onClick={event => {
                                                        event.stopPropagation();
                                                        console.log(`deleting project ${id}`);
                                                        actions.deleteProject(id);
                                                    }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
            </Container>
        );
    }
}

export default ProjectsList;
