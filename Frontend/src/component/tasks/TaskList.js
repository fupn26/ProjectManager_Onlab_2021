//import {Button, Card} from "react-bootstrap";
import React from "react";
import {Redirect} from "react-router-dom";
import PropTypes from "prop-types";
import {changeStatus, getTasks} from "../../action/Tasks";
import taskStore from "../../store/TaskStore";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {Button, Card} from "react-bootstrap";
import {doing, doings, done, dones, toDo, toDos} from "../../action/TaskStatusConstants";
//import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
//import {v4 as uuidV4} from 'uuid';

class TaskList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: null,
            redirect: false,
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
        this.setState({redirect: true});
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
        if (this.state.tasks === taskStore._tasks)
            getTasks(this.props.projectid);
        else
            this.setState({tasks: taskStore._tasks});
    }

    render() {
        if (this.state.redirect)
            return (<Redirect push to={{
                pathname: '/tasks/add',
                state: { project_id: this.props.projectid}
            }}/>);
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