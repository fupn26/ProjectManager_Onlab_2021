import React from 'react';
import sessionStore from '../../store/SessionStore';
import {Redirect} from "react-router-dom";
import dispatcher from "../../dispatcher/Dispatcher";
import {changeRedirectUri} from "../../dispatcher/UserActionConstants";

class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isUserLoggedIn: sessionStore._isUserLoggedIn
        };
        this._updateSessionState = this._updateSessionState.bind(this);
    }

    componentDidMount() {
        sessionStore.addChangeListener(this._updateSessionState);
        if (!this.state.isUserLoggedIn)
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: "/profile"
            });
    }

    componentDidUpdate() {
        if (!this.state.isUserLoggedIn)
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: "/profile"
            });
    }

    componentWillUnmount() {
        sessionStore.removeChangeListener(this._updateSessionState);
    }

    _updateSessionState() {
        this.setState({
            isUserLoggedIn: sessionStore._isUserLoggedIn
        });
    }

    render() {
        return (
            <div>
                {
                    !sessionStore._isUserLoggedIn && <Redirect to={"/login"}/>
                }
                <h2>
                    Profile page
                </h2>
            </div>
        );
    }
}

export default Profile;