import {Alert, Button, FormControl, FormLabel} from "react-bootstrap";
import React from "react";
import {signIn} from "../../action/Users";
import sessionStore from "../../store/SessionStore";
import {Redirect} from "react-router-dom";

class LoginForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
            usernameFilled: false,
            passwordFilled: false,
            hasError: false,
            isLoggedIn: false
        };
        this._onUsernameChanged = this._onUsernameChanged.bind(this);
        this._onPasswordChanged = this._onPasswordChanged.bind(this);
        this._onSignIn = this._onSignIn.bind(this);
        this._updateStateFromStore = this._updateStateFromStore.bind(this);
    }

    _onUsernameChanged(event) {
        this.setState({
            username: event.target.value
        });
        if (event.target.value === "")
            this.setState({usernameFilled: false});
        else
            this.setState({usernameFilled: true});
    }

    _onPasswordChanged(event) {
        this.setState({
            password: event.target.value
        });
        if (event.target.value === "")
            this.setState({passwordFilled: false});
        else
            this.setState({passwordFilled: true});
    }

    _onSignIn() {
        signIn(this.state.username, this.state.password);
    }

    _updateStateFromStore() {
        this.setState({
            hasError: sessionStore._isLoginError,
            isLoggedIn: sessionStore._isUserLoggedIn
        });
    }

    componentDidMount() {
        sessionStore.addChangeListener(this._updateStateFromStore);
    }

    componentWillUnmount() {
        sessionStore.removeChangeListener(this._updateStateFromStore);
    }

    render() {
        return (
          <div className={"d-flex align-items-center justify-content-center"} style={{
              height: "100%",
              border: "solid"
          }}>
              <div>
                  {
                      this.state.isLoggedIn && <Redirect push to={sessionStore._redirectToOnSuccess}/>
                  }
                  {
                      this.state.hasError && <Alert variant={"danger"}>Invalid username or password</Alert>
                  }
                  <FormLabel>Username</FormLabel>
                  <FormControl onChange={this._onUsernameChanged}/>
                  <FormLabel>Password</FormLabel>
                  <FormControl type={"password"} onChange={this._onPasswordChanged}/>
                  <div>
                      <Button disabled={!(this.state.usernameFilled && this.state.passwordFilled)}
                              style={{margin: "1em 0 0 0", width: "100%"}}
                              onClick={this._onSignIn}>Sign in</Button>
                  </div>
                  <div>
                      <Button variant={"success"} style={{margin: "1em 0 0 0", width: "100%"}}>Register</Button>
                  </div>
              </div>
          </div>
        );
    }
}

export default LoginForm;