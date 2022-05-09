import React from 'react';
import {Alert, Button, FormControl, FormLabel} from "react-bootstrap";
import {Redirect} from "react-router-dom";
import {registerUser} from "../../action/Users";
import sessionStore from "../../store/impl/SessionStore";

class RegisterForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            username: "",
            password: "",
            isRegisterEnabled: false,
            redirect: false,
            showError: false
        };

        this._onEmailChange = this._onEmailChange.bind(this);
        this._onUsernameChange = this._onUsernameChange.bind(this);
        this._onPasswordChange = this._onPasswordChange.bind(this);
        this._enableRegisterButton = this._enableRegisterButton.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._onCancel = this._onCancel.bind(this);
        this._updateStateFromStore = this._updateStateFromStore.bind(this);
    }

    componentDidMount() {
        sessionStore.addChangeListener(this._updateStateFromStore);
    }

    componentWillUnmount() {
        sessionStore.removeChangeListener(this._updateStateFromStore);
    }

    _updateStateFromStore() {
        if (sessionStore._registerError)
            this.setState({
                showError: true
            });
        else {
            this.setState({
                redirect: true
            });
        }
    }

    _onEmailChange(event) {
        this.setState({
            email: event.target.value
        });
        this._enableRegisterButton();
    }

    _onUsernameChange(event) {
        this.setState({
            username: event.target.value
        });
        this._enableRegisterButton();
    }

    _onPasswordChange(event) {
        this.setState({
            password: event.target.value
        });
        this._enableRegisterButton();
    }

    _enableRegisterButton() {
        this.setState({
            isRegisterEnabled: (this.state.email !== "" && this.state.username !== ""
                && this.state.password !== "")
        });
    }

    _onSubmit() {
        registerUser(this.state.email, this.state.username, this.state.password);
    }

    _onCancel() {
        this.setState({
            redirect: true
        });
    }

    render() {
        if (this.state.redirect)
            return (<Redirect to={"/"}/>);
        return (
            <div className={"d-flex justify-content-center"}>
                <div>
                    {
                        this.state.showError && <Alert>Sorry! Registration failed!</Alert>
                    }
                    <FormLabel>E-mail address</FormLabel>
                    <FormControl type={"email"} onChange={this._onEmailChange}/>
                    <FormLabel>Username</FormLabel>
                    <FormControl onChange={this._onUsernameChange}/>
                    <FormLabel>Password</FormLabel>
                    <FormControl type={"password"} onChange={this._onPasswordChange}/>
                    <div className={"d-flex justify-content-end"} style={{
                        paddingTop: "1em"
                    }}>
                        <Button variant={"success"} style={{
                            marginRight: "1em"
                        }} disabled={!this.state.isRegisterEnabled} onClick={this._onSubmit}>Register</Button>
                        <Button variant={"danger"} onClick={this._onCancel}>Cancel</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default RegisterForm;