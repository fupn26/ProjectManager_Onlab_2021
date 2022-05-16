import {
    Button, Container,
    Form,
    FormControl,
    FormLabel, FormSelect,
    Modal,
    ModalBody,
    ModalFooter,
    ModalTitle, Row,
} from "react-bootstrap";
import ModalHeader from "react-bootstrap/ModalHeader";
import React from "react";
import PropTypes from 'prop-types';
import UserAdd from "../users/UserAdd";
import userStore from "../../store/impl/UserStore";
import {getUserInfo, getUsers} from "../../action/Users";
import {fetchAllProjects} from "../../action/Projects";
import projectStore from "../../store/impl/ProjectStore";
import logger from "../../logger/Logger";
import {createMeeting, updateMeeting} from "../../action/Meeting";

class EventEditorModal extends React.Component {
    constructor(props) {
        super(props);
        logger.info('Passed meeting:' + props.meeting);
        this.state = {
            users: userStore._users,
            projects: projectStore._projects,
            user: userStore._current_user,
            optionPlaceholderText: 'Select project...',
            isProjectSelected: false,
            selectedProject: null,
            memberList: []
        };
        this._onUserListUpdated = this._onUserListUpdated.bind(this);
        this._onUserUpdated = this._onUserUpdated.bind(this);
        this._onSaveChanges = this._onSaveChanges.bind(this);
        this._onProjectListUpdated = this._onProjectListUpdated.bind(this);
        this._onProjectSelectChanged = this._onProjectSelectChanged.bind(this);
        this._onCloseDialog = this._onCloseDialog.bind(this);
        this._mapToUserWithNameId = this._mapToUserWithNameId.bind(this);
        this._onMemberAddedToMeeting = this._onMemberAddedToMeeting.bind(this);
        this._onMemberDeletedToMeeting = this._onMemberDeletedToMeeting.bind(this);
        this._getMeetingTitle = this._getMeetingTitle.bind(this);
        this._getMeetingPlace = this._getMeetingPlace.bind(this);
        this._getMeetingNotes = this._getMeetingNotes.bind(this);
        this._isEditing = this._isEditing.bind(this);
        this._onShow = this._onShow.bind(this);
    }

    componentDidMount() {
        console.log('editor modal has been mounted');
        getUsers();
        getUserInfo();
        userStore.addChangeListener(this._onUserUpdated);
        userStore.addChangeListener(this._onUserListUpdated);
        projectStore.addChangeListener(this._onProjectListUpdated);
    }

    componentWillUnmount() {
        userStore.removeChangeListener(this._onUserListUpdated);
        userStore.removeChangeListener(this._onUserUpdated);
        projectStore.removeChangeListener(this._onProjectListUpdated);
    }

    _onProjectListUpdated() {
        this.setState({
            projects: projectStore._projects.filter(project => {
                return project.members.includes(this.state.user.id);
            })
        });
    }

    _onUserListUpdated() {
        this.setState({
            users: userStore._users
        });
    }

    _onUserUpdated() {
        this.setState({
            user: userStore._current_user,
        });
        fetchAllProjects();
    }

    _onSaveChanges() {
        this.setState({
            selectedProject: null,
            isProjectSelected: false
        });
        const timeZoneOffset = this._getTimezoneOffset(this.props.startDate);
        const meetingToSave = {
            projectId: this.state.selectedProject.id,
            theme: document.getElementById('title_input').value,
            startTime: document.getElementById('start_date_input').value + timeZoneOffset,
            endTime: document.getElementById('end_date_input').value + timeZoneOffset,
            place: document.getElementById('place_input').value,
            participants: [...this.state.memberList, this.state.user.id],
            notes: this._isEditing() ? document.getElementById('notes_input').value : ''
        };
        if (this._isEditing())
            updateMeeting(this.props.meeting.id, meetingToSave);
        else
            createMeeting(meetingToSave);
        this.props.onClose();
    }

    _onCloseDialog() {
        this.setState({
            selectedProject: null,
            isProjectSelected: false
        });
        logger.info('alma');
        this.props.onClose();
    }

    _onProjectSelectChanged(event) {
        logger.info('Project selection changed...');
        const project = this.state.projects.find(project => project.id === event.target.value);
        if (project !== undefined) {
            this.setState({
                selectedProject: project,
                isProjectSelected: true
            });
        } else {
            this.setState({
                selectedProject: null,
                isProjectSelected: false
            });
        }
    }

    _mapToUserWithNameId(userId) {
        const user = this.state.users.find(user => user.id === userId);
        if (user == null)
            return {
                id: userId,
                username: 'Unknown'
            };
        return {
            id: user.id,
            username: user.username
        };
    }

    _onMemberAddedToMeeting(memberId) {
        const members = this.state.memberList;
        members.push(memberId);
        this.setState({
            memberList: members
        });
    }

    _onMemberDeletedToMeeting(memberId) {
        const members = this.state.memberList.filter(id => memberId === id);
        this.setState({
            memberList: members
        });
    }

    _mapToLocaleString(dateStr) {
        return dateStr.slice(0, 19);
    }

    _getTimezoneOffset(dateStr) {
        return dateStr.slice(19);
    }

    _getMeetingTitle() {
        if (this._isEditing())
            return this.props.meeting.theme;
        else
            return '';
    }

    _getMeetingPlace() {
        if (this._isEditing())
            return this.props.meeting.place;
        else
            return '';
    }

    _getMeetingNotes() {
        if (this._isEditing())
            return this.props.meeting.notes;
        else
            return '';
    }

    _isEditing() {
        return this.props.meeting != null;
    }

    _onShow() {
        if (this._isEditing()) {
            const select = document.getElementById('project_select_input');
            select.value = this.props.meeting.projectId;
            this._onProjectSelectChanged({
                target: select
            });
        }
    }

    render() {
        return (
            <>
                <Modal show={this.props.show} onShow={this._onShow}>
                    <ModalHeader>
                        <ModalTitle>{this._isEditing() ? 'Edit event' : 'Create event'}</ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormLabel>Title:</FormLabel>
                            <FormControl id={'title_input'} type='text' defaultValue={this._getMeetingTitle()}/>
                            <FormLabel>From:</FormLabel>
                            <FormControl id={'start_date_input'} type='datetime-local'
                                         defaultValue={this._mapToLocaleString(this.props.startDate)}/>
                            <FormLabel>To:</FormLabel>
                            <FormControl id={'end_date_input'} type='datetime-local'
                                         defaultValue={this._mapToLocaleString(this.props.endDate)}/>
                            <FormLabel>Place:</FormLabel>
                            <FormControl id={'place_input'} type='text' defaultValue={this._getMeetingPlace()}/>
                            <FormLabel>Select project:</FormLabel>
                            <FormSelect id={'project_select_input'} style={{
                                width: "100%"
                            }} onChange={this._onProjectSelectChanged}>
                                <option value={this.state.optionPlaceholderText}>{this.state.optionPlaceholderText}</option>
                                {
                                    this.state.projects.map(project => <option key={project.id} value={project.id}>
                                        {project.title}
                                    </option>)
                                }
                            </FormSelect>
                            {
                                this.state.isProjectSelected && <UserAdd members={this.props.meeting == null ? []
                                    : this.props.meeting.participants.map(this._mapToUserWithNameId)}
                                                                         users={this.state.users}
                                                                         creator={this.state.user.id}
                                                                         onMemberAdded={this._onMemberAddedToMeeting}
                                                                         onMemberDeleted={this._onMemberDeletedToMeeting}/>
                            }
                            {
                                (this._isEditing()) &&
                                <>
                                    <Container>
                                        <Row>
                                            <FormLabel>Notes:</FormLabel>
                                        </Row>
                                        <Row style={{
                                            width: "100%"
                                        }}>
                                            <textarea id={'notes_input'} defaultValue={this._getMeetingNotes()}/>
                                        </Row>
                                    </Container>
                                </>
                            }
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="secondary" onClick={this._onCloseDialog}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={this._onSaveChanges} disabled={!this.state.isProjectSelected}>
                            Save Changes
                        </Button>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}

EventEditorModal.propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func,
    meeting: PropTypes.object,
    startDate: PropTypes.string,
    endDate: PropTypes.string
};

export default EventEditorModal;