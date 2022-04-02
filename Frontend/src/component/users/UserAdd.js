import React from "react";
import PropTypes from "prop-types";
import {Button, FormLabel, FormSelect, ListGroup, ListGroupItem} from "react-bootstrap";
import logger from "../../logger/Logger";

/**
 * Helper component for adding users to a list and
 * providing a selection for the rest of the users.
 */
class UserAdd extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            members: props.members == null || props.creator == null ? props.members
                : props.members.filter(member => member.id !== props.creator),
            optionPlaceholderText: "Select a user to add..."
        };
        logger.info(JSON.stringify(this.state.members));
        this._isUserCanBeAdded = this._isUserCanBeAdded.bind(this);
        this._onDeleteFromMembers = this._onDeleteFromMembers.bind(this);
        this._mapToUserName = this._mapToUserName.bind(this);
        this._onSelectChange = this._onSelectChange.bind(this);
    }

    _isUserCanBeAdded(user) {
        return user.id !== this.props.creator //user is not owner
            && this.state.members.find(member => member.id === user.id) === undefined; //user is not among the members
    }

    _onDeleteFromMembers(userId) {
       this.setState({
            members: this.state.members.filter(member => member.id !== userId)
        });
       this.props.onMemberDeleted(userId);
    }

    _mapToUserName(userId) {
        if (this.props.users == null) {
            logger.info('user array is null');
            return "Unknown";
        }
        else {
            const user = this.props.users.find(element => element.id === userId);
            if (user == null) {
                logger.info(`user not found: ${userId}`);
                return "Unknown";
            }
            return user.username;
        }
    }

    _onSelectChange(event) {
        if (event.target.value !== this.state.optionPlaceholderText) {
            const newMembers = this.state.members;
            const member = this.props.users.find(user => user.id === event.target.value);
            newMembers.push(member);
            this.setState({
                members: newMembers
            });
            this.props.onMemberAdded(member.id);
        }
    }

    render() {
        return (
            <>
                <FormLabel>Members</FormLabel>
                <ListGroup>
                    <ListGroupItem>{this._mapToUserName(this.props.creator)}</ListGroupItem>
                    {
                        this.state.members.map(member => (
                            <ListGroupItem key={member.id}>
                                <div className={"d-flex justify-content-between"}>
                                    <div>{member.username}</div>
                                    <div>
                                        <Button variant={"danger"}
                                                onClick={() => this._onDeleteFromMembers(member.id)}>Delete</Button>
                                    </div>
                                </div>
                            </ListGroupItem>
                        ))
                    }
                </ListGroup>
                <FormLabel>Select members to add:</FormLabel>
                <div>
                    <FormSelect style={{
                        width: "100%"
                    }} onChange={this._onSelectChange}>
                        <option value={this.state.optionPlaceholderText}>{this.state.optionPlaceholderText}</option>
                        {
                            this.props.users.filter(this._isUserCanBeAdded).map(user => {
                                return (
                                    <option key={user.id} value={user.id}>{user.username}</option>
                                );
                            })
                        }
                    </FormSelect>
                </div>
            </>
        );
    }
}

/**
 * The necessary structure of items in users and members:
 * {
 *     id,
 *     username
 * }
 *
 * @type {{creator: Requireable<string>, members: Requireable<any[]>, users: Requireable<any[]>}}
 */
UserAdd.propTypes = {
    users: PropTypes.array,
    members: PropTypes.array,
    creator: PropTypes.string,
    onMemberAdded: PropTypes.func,
    onMemberDeleted: PropTypes.func
};

export default UserAdd;