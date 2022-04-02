//import {Button, Card} from "react-bootstrap";
import React from "react";
import {Redirect} from "react-router-dom";
import PropTypes from "prop-types";
import {changeStatus, deleteTask, getTasks} from "../../action/Tasks";
import taskStore from "../../store/impl/TaskStore";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {Button, Card} from "react-bootstrap";

import {doing, doings, done, dones, toDo, toDos} from "../../action/TaskStatusConstants";

class TaskList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: null,
            redirectToRecordForm: false,
            redirectToTaskDetails: false,
            selectedTaskId: null,
            columns: [
                {
                    id: toDos,
                    name: 'To Do'
                },
                {
                    id: doings,
                    name: 'Doing'
                },
                {
                    id: dones,
                    name: 'Done'
                }
            ]
        };
    }

    _onAddClicked = () => {
        console.log("Clicked");
        this.setState({redirectToRecordForm: true});
    }

    _onDragEnd = (results) => {
        if (!results.destination) return;
        console.log(results);
        const destStatus = results.destination.droppableId;
        let status;
        if (destStatus === toDos)
            status = toDo;
        else if (destStatus === doings)
            status = doing;
        else if (destStatus === dones)
            status = done;
        changeStatus(results.draggableId, status);
    }

    componentDidMount() {
        getTasks(this.props.projectid);
        taskStore.addChangeListener(this._getAllTaskFromStore);
    }

    componentWillUnmount() {
        taskStore.removeChangeListener(this._getAllTaskFromStore);
    }

    _getAllTaskFromStore = () => {
        this.setState({tasks: taskStore._tasks});
    }

    _onDeleteButtonClicked = (taskId) => {
        deleteTask(taskId);
    }

    _onDetailsButtonClicked = (taskId) => {
        this.setState({
            redirectToTaskDetails: true,
            selectedTaskId: taskId
        });
    }

    render() {
        if (this.state.redirectToRecordForm)
            return (<Redirect push to={`/tasks/add/${this.props.projectid}`}/>);
        if (this.state.redirectToTaskDetails)
            return (<Redirect push to={`/tasks/${this.state.selectedTaskId}`}/>);
        if (this.state.tasks === null) {
            return (<h3>{`Can't load tasks for project ${this.props.projectid}`}</h3>);
        }
        return (
            <div className={'row row-cols-1 row-cols-md-3 g-4'}>
                <DragDropContext onDragEnd={this._onDragEnd}>
                    {this.state.columns.map(column => (
                        <Droppable droppableId={column.id} key={column.id}>
                            {(provided) => {
                                const taskList = this.state.tasks[column.id];
                                return (
                                <div className={'col'}>
                                    <Card>
                                        <Card.Header>{column.name}</Card.Header>
                                        <Card.Body>
                                            <div className={'scrollable'}
                                                 {...provided.droppableProps}
                                                 ref={provided.innerRef}
                                            >
                                                {taskList.map((item, index) => (
                                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                                        {(provided) => (
                                                            <div className={'card'}
                                                                 ref={provided.innerRef}
                                                                 {...provided.draggableProps}
                                                                 {...provided.dragHandleProps}
                                                                style={{
                                                                    ...provided.draggableProps.style
                                                                }}
                                                            >
                                                                <Card.Header>{item.title}</Card.Header>
                                                                <Card.Body>{item.description}</Card.Body>
                                                                <Card.Footer>
                                                                    <Button variant={'danger'} onClick={() =>
                                                                        this._onDeleteButtonClicked(item.id)}>Delete</Button>
                                                                    <Button variant={'primary'} onClick={() =>
                                                                        this._onDetailsButtonClicked(item.id)
                                                                    }>Details</Button>
                                                                </Card.Footer>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            </div>
                                        </Card.Body>
                                        {
                                            column.id === toDos &&
                                                <Card.Footer>
                                                    <Button style={{
                                                        width: "100%"
                                                    }} onClick={this._onAddClicked}>Add</Button>
                                                </Card.Footer>
                                        }
                                    </Card>
                                </div>
                            );}}
                        </Droppable>
                    ))}
                </DragDropContext>
            </div>
        );
    }
}

TaskList.propTypes ={
    projectid: PropTypes.string
};

export default TaskList;