import React from "react";
//import Calendar from 'react-awesome-calendar';
import sessionStore from "../../store/SessionStore";
import dispatcher from "../../dispatcher/Dispatcher";
import {changeRedirectUri} from "../../dispatcher/SessionActionConstants";
import {Redirect} from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';

class EventCalendar extends React.Component {
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
                payload: "/calendar"
            });
    }

    componentDidUpdate() {
        if (!this.state.isUserLoggedIn)
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: "/calendar"
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
                    !this.state.isUserLoggedIn && <Redirect to={"/login"}/>
                }
                <FullCalendar
                    plugins={[ dayGridPlugin ]}
                    initialView="dayGridMonth"
                />
            </div>
        );
    }
}

export default EventCalendar;