import React from "react";
import {Button, Modal, ModalBody, ModalFooter, Table} from "react-bootstrap";
import PropTypes from "prop-types";
import userStore from "../../store/impl/UserStore";
import projectStore from "../../store/impl/ProjectStore";
import {deleteMeeting} from "../../action/Meeting";

class EventInfoModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fontStyle: {
                fontWeight: "bold"
            },
            users: [],
            projects: []
        };
        this._onUserListChange = this._onUserListChange.bind(this);
        this._onProjectListChange = this._onProjectListChange.bind(this);
        this._mapToUsername = this._mapToUsername.bind(this);
        this._mapToProjectTitle = this._mapToProjectTitle.bind(this);
        this._onDeleteClicked = this._onDeleteClicked.bind(this);
    }

    componentDidMount() {
        userStore.addChangeListener(this._onUserListChange);
        projectStore.addChangeListener(this._onProjectListChange);
    }

    _onUserListChange() {
        this.setState({
            users: userStore._users
        });
    }

    _onProjectListChange() {
        this.setState({
            projects: projectStore._projects
        });
    }

    _mapToUsername(userId) {
        const user = this.state.users.find(user => user.id === userId);
        if (user != null)
            return user.username;
        else
            return 'Unknown';
    }

    _mapToProjectTitle(projectId) {
        const project = this.state.projects.find(project => project.id === projectId);
        if (project != null)
            return project.title;
        else
            return 'Unknown';
    }

    _onDeleteClicked() {
        if (this.props.meeting != null)
            deleteMeeting(this.props.meeting.id);
        this.props.onClose();
    }

    render() {
        let itemId = 0;
        return (
            <>
                <Modal show={this.props.show}>
                    <Modal.Header>
                        {this.props.meeting == null ? 'Unknown' : this.props.meeting.theme}
                    </Modal.Header>
                    <ModalBody>
                        {
                            this.props.meeting != null && <Table>
                                <tbody>
                                <tr key={`table_row_${itemId++}`}>
                                    <td style={this.state.fontStyle}>Start Date:
                                    </td>
                                    <td>{this.props.meeting.startTime}</td>
                                </tr>
                                <tr key={`table_row_${itemId++}`}>
                                    <td style={this.state.fontStyle}>End Date:</td>
                                    <td>{this.props.meeting.endTime}</td>
                                </tr>
                                <tr key={`table_row_${itemId++}`}>
                                    <td style={this.state.fontStyle}>Project:</td>
                                    <td>{this._mapToProjectTitle(this.props.meeting.projectId)}</td>
                                </tr>
                                <tr key={`table_row_${itemId++}`}>
                                    <td style={this.state.fontStyle}>Created by:</td>
                                    <td>{this._mapToUsername(this.props.meeting.creatorId)}</td>
                                </tr>
                                <tr key={`table_row_${itemId++}`}>
                                    <td style={this.state.fontStyle}>Place:</td>
                                    <td>{this.props.meeting.place}</td>
                                </tr>
                                <tr key={`table_row_${itemId++}`}>
                                    <td style={this.state.fontStyle}>Notes:</td>
                                    <td>{this.props.meeting.notes}</td>
                                </tr>
                                {
                                    this.props.meeting.participants.map((userId, index, array) => {
                                        if (index === 0) {
                                            return (
                                                <tr key={`table_row_${itemId++}`}>
                                                    <td rowSpan={array.length}>Participants:</td>
                                                    <td>{this._mapToUsername(userId)}</td>
                                                </tr>
                                            );
                                        }
                                        else {
                                            return (
                                                <tr key={`table_row_${itemId++}`}>
                                                    <td>{this._mapToUsername(userId)}</td>
                                                </tr>
                                            );
                                        }
                                    })
                                }
                                </tbody>
                            </Table>

                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button variant='secondary' onClick={this.props.onClose}>Close</Button>
                        <Button variant='danger' onClick={this._onDeleteClicked}>Delete</Button>
                        <Button variant='primary' onClick={this.props.onEdit}>Edit</Button>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}

EventInfoModal.propTypes = {
    show: PropTypes.bool,
    meeting: PropTypes.object,
    onClose: PropTypes.func,
    onEdit: PropTypes.func
};

export default EventInfoModal;