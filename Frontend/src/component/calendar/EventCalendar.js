import React from "react";
//import Calendar from 'react-awesome-calendar';
import sessionStore from "../../store/impl/SessionStore";
import meetingStore from "../../store/impl/MeetingStore";
import dispatcher from "../../dispatcher/Dispatcher";
import {changeRedirectUri} from "../../dispatcher/SessionActionConstants";
import {Redirect} from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventEditorModal from "./EventEditorModal";
import {getMeetings} from "../../action/Meeting";
import logger from "../../logger/Logger";

class EventCalendar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isUserLoggedIn: sessionStore._isUserLoggedIn,
            showModal: false,
            meetings: null
        };
        this._updateSessionState = this._updateSessionState.bind(this);
        this._updateMeetingState = this._updateMeetingState.bind(this);
        this._onTimeSelected = this._onTimeSelected.bind(this);
        this._onModalClosed = this._onModalClosed.bind(this);
    }

    componentDidMount() {
        sessionStore.addChangeListener(this._updateSessionState);
        meetingStore.addChangeListener(this._updateMeetingState);
        if (!this.state.isUserLoggedIn)
            dispatcher.dispatch({
                action: changeRedirectUri,
                payload: "/calendar"
            });
        else {
            getMeetings();
        }
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
        sessionStore.removeChangeListener(this._updateMeetingState);
    }

    _updateSessionState() {
        this.setState({
            isUserLoggedIn: sessionStore._isUserLoggedIn
        });
    }

    _updateMeetingState() {
        this.setState({
            meetings: meetingStore._meetings
        });
    }

    _onTimeSelected(info) {
        logger.info(`Selection start: ${info.startStr}`);
        logger.info(`Selection end: ${info.endStr}`);
        this.setState({
            show: true
        });
    }

    _onEventClicked(info) {
        logger.info(info);
        //TODO: handle event clicking correctly
    }

    _onModalClosed() {
        this.setState({
            show: false
        });
    }

    _mapToCalendarEvent(meeting) {
        return {
            id: meeting.id,
            title: meeting.theme,
            start: meeting.startTime,
            end: meeting.endTime
        };
    }

    render() {
        return (
            <div>
                {
                    !this.state.isUserLoggedIn && <Redirect to={"/login"}/>
                }
                <FullCalendar
                    plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
                    initialView='timeGridDay'
                    headerToolbar={{
                        start: 'prev,next',
                        center: 'title',
                        right: 'timeGridDay,timeGridWeek,dayGridMonth'
                    }}
                    selectable={true}
                    select={this._onTimeSelected}
                    events={this.state.meetings == null ? [] : this.state.meetings.map(this._mapToCalendarEvent)}
                    eventClick={this._onEventClicked}
                />
                <EventEditorModal show={this.state.show} onClose={this._onModalClosed}/>
            </div>
        );
    }
}

export default EventCalendar;