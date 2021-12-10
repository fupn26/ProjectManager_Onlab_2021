import React from "react";
import * as actions from '../../action/Projects';
import {Redirect} from "react-router-dom";
import sessionStore from "../../store/SessionStore";
import dispatcher from "../../dispatcher/Dispatcher";
import {changeRedirectUri} from "../../dispatcher/UserActionConstants";

class ProjectRecordingForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            title: '',
            finished: false,
            isUserLoggedIn: sessionStore._isUserLoggedIn
        };
        this._formOnChange = this._formOnChange.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
        this._updateSessionStateFromStore = this._updateSessionStateFromStore.bind(this);
    }

    componentDidMount() {
        sessionStore.addChangeListener(this._updateSessionStateFromStore);
        if (!this.state.isUserLoggedIn) {
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: "/projects/new"
            });
        }
    }

    componentDidUpdate() {
        if (!this.state.isUserLoggedIn) {
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: "/projects/new"
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
        if (!this.state.isUserLoggedIn)
            return (<Redirect to={"/login"}/>);

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
