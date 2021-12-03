import React from "react";
import * as actions from '../../action/Projects';
import {Redirect} from "react-router-dom";

class ProjectRecordingForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            title: '',
            finished: false,
        };
        this._formOnChange = this._formOnChange.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
    }

    _formOnChange(event){
        const {value} = event.target;
        this.setState({title : value});
    }

    _handleSubmit(){
        console.log(`Create project: ${this.state.title}`);
        actions.recordProject(this.state);
        this.setState({finished : true});
    }

    render() {
        if (this.state.finished)
            return (<Redirect to={`/projects`}/>);

        return(
            <div>
                <form>
                    <div className="form-group">
                        <label htmlFor="newProjectTitle">Project title</label>
                        <input className="form-control" id="newProjectTitle"
                               aria-describedby="titleHelp"
                               placeholder="Enter project title" onChange={this._formOnChange}/>
                        <small id="titleHelp" className="form-text text-muted">
                            {"Choose a name which is unique among your projects!"}
                        </small>
                    </div>
                </form>
                <button className="btn btn-primary"
                        onClick={this._handleSubmit}>
                    Submit
                </button>
            </div>
        );
    }
}

export default ProjectRecordingForm;
