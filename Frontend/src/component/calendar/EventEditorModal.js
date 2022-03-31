import {Button, Modal, ModalBody, ModalFooter, ModalTitle} from "react-bootstrap";
import ModalHeader from "react-bootstrap/ModalHeader";
import React from "react";
import PropTypes from 'prop-types';

class EventEditorModal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <Modal show={this.props.show}>
                    <ModalHeader>
                        <ModalTitle>{this.props.edit ? 'Edit event' : 'Create event'}</ModalTitle>
                    </ModalHeader>
                    <ModalBody/>
                    <ModalFooter>
                        <Button variant="secondary" onClick={this.props.onClose}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={this.props.onClose}>
                            Save Changes
                        </Button>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}

EventEditorModal.propTypes = {
    edit: PropTypes.bool,
    show: PropTypes.bool,
    onClose: PropTypes.func
};

export default EventEditorModal;