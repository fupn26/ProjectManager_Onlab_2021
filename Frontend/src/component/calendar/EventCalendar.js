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
import EventInfoModal from "./EventInfoModal";

class EventCalendar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isUserLoggedIn: sessionStore._isUserLoggedIn,
            startDate: '',
            endDate: '',
            showEditorModal: false,
            showInfoModal: false,
            meetings: [],
            selectedMeeting: null
        };
        this._updateSessionState = this._updateSessionState.bind(this);
        this._updateMeetingState = this._updateMeetingState.bind(this);
        this._onTimeSelected = this._onTimeSelected.bind(this);
        this._onInfoModalClosed = this._onInfoModalClosed.bind(this);
        this._onEditorModalClosed = this._onEditorModalClosed.bind(this);
        this._onEventClicked = this._onEventClicked.bind(this);
        this._onEditRequested = this._onEditRequested.bind(this);
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
            showEditorModal: true,
            startDate: info.startStr,
            endDate: info.endStr
        });
    }

    _onEventClicked(info) {
        logger.info(JSON.stringify(info.event));
        //TODO: handle event clicking correctly
        logger.info(JSON.stringify(this.state.meetings));
        const meeting = this.state.meetings.find(meeting => meeting.id === info.event.id);
        if (meeting != null) {
            meeting.startTime = info.event.startStr;
            meeting.endTime = info.event.endStr;
            this.setState({
                showInfoModal: true,
                selectedMeeting: meeting
            });
        }
    }

    _onInfoModalClosed() {
        this.setState({
            showInfoModal: false,
        });
    }

    _onEditorModalClosed() {
        this.setState({
            showEditorModal: false,
        });
    }

    _onEditRequested() {
        this._onInfoModalClosed();
        this.setState({
            showEditorModal: true
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
        logger.info(`User logged in: ${this.state.isUserLoggedIn}`);
        if (!this.state.isUserLoggedIn)
            return (
                <Redirect to={"/login"}/>
            );
        return (
            <div>
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
                <EventEditorModal show={this.state.showEditorModal} startDate={this.state.startDate}
                                  endDate={this.state.endDate} meeting={this.state.selectedMeeting} onClose={this._onEditorModalClosed}/>
                <EventInfoModal show={this.state.showInfoModal} meeting={this.state.selectedMeeting}
                                onEdit={this._onEditRequested} onClose={this._onInfoModalClosed}/>
            </div>
        );
    }
}

export default EventCalendar;