import React from "react";
//import Calendar from 'react-awesome-calendar';
import sessionStore from "../../store/impl/SessionStore";
import dispatcher from "../../dispatcher/Dispatcher";
import {changeRedirectUri} from "../../dispatcher/SessionActionConstants";
import {Redirect} from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventEditorModal from "./EventEditorModal";

class EventCalendar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isUserLoggedIn: sessionStore._isUserLoggedIn,
            showModal: false
        };
        this._updateSessionState = this._updateSessionState.bind(this);
        this._onTimeSelected = this._onTimeSelected.bind(this);
        this._onModalClosed = this._onModalClosed.bind(this);
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

    _onDateClicked(info) {
        alert('Clicked on: ' + info.dateStr);
        alert('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
        alert('Current view: ' + info.view.type);
        // change the day's background color just for fun
        info.dayEl.style.backgroundColor = 'red';
    }

    _onTimeSelected(info) {
        alert(`Selection start: ${info.startStr}`);
        alert(`Selection end: ${info.endStr}`);
        this.setState({
            show: true
        });
    }

    _onModalClosed() {
        this.setState({
            show: false
        });
    }

    render() {
        return (
            <div>
                {
                    !this.state.isUserLoggedIn && <Redirect to={"/login"}/>
                }
                <FullCalendar
                    plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
                    initialView="timeGridDay"
                    headerToolbar={{
                        start: 'prev,next',
                        center: 'title',
                        right: 'timeGridDay,timeGridWeek,dayGridMonth'
                    }}
                    selectable={true}
                    select={this._onTimeSelected}
                />
                <EventEditorModal show={this.state.show} onClose={this._onModalClosed}/>
            </div>
        );
    }
}

export default EventCalendar;