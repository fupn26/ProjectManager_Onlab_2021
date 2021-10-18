import React from "react";
import * as actions from '../../action/Projects';
import Modal from "react-bootstrap/Modal";
import {Button} from "react-bootstrap";
class ProjectRecordingForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            title: '',
            show: false,
        };
        this.formOnChange = this.formOnChange.bind(this);
    }

    formOnChange(event){
        const {name,value} = event.target;
        this.setState({[name] : value});
    }

    handleClose = () => this.setState({show: false});
    handleShow = () => this.setState({show: true});

    render() {
        return(
            <Modal show={this.state.show} onHide={this.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create new project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <label htmlFor={"title"} >Title</label>
                    <input type={"text"} id={"title"} name={"title"} value={this.state.title} onChange={this.formOnChange}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={this.handleClose}>
                        Submit
                    </Button>
                </Modal.Footer>
                <button onClick={()=> actions.recordTask(this.state)}>Submit</button>
            </Modal>
        );
    }
}

export default ProjectRecordingForm;
