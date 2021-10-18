import React from 'react';
import store from '../../store/ProjectStore';
import * as actions from '../../action/Projects';
import {Redirect} from "react-router-dom";

class ProjectsList extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            projects : [],
            redirect : null
        };
        this._updateStateFromStore = this._updateStateFromStore.bind(this);
    }

    componentDidMount() {
        console.log("component mounted");
        actions.fetchAllProjects();
        store.addChangeListener(this._updateStateFromStore);
    }

    componentWillUnmount() {
        store.removeChangeListener(this._updateStateFromStore);
    }

    handleOnClick(id) {
        console.log("id changed");
        this.setState(() => ({redirect : id}));
    }

    _updateStateFromStore(){
        this.setState(() => ({projects: store._projects}));
    }

    render() {
        if (this.state.redirect != null)
            return (<Redirect push to={`/projects/${this.state.redirect}`}/>);

        return (
            <div>
                <table className="table table-hover">
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Owner</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.projects.map(({id, title, owner}) => {
                            return (
                                <tr key={id} onClick={this.handleOnClick.bind(this, id)}>
                                    <td>{title}</td>
                                    <td>{owner}</td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default ProjectsList;
