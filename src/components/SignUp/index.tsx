import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";
import "./signup.css";

const INITIAL_STATE = {
  username: "",
  lastname: "",
  email: "",
  passwordOne: "",
  passwordTwo: "",
  isAdmin: false,
  error: null,
};

type MyProps = {
  // using `interface` is also ok
  firebase: any;
};
type MyState = {
  username: string;
  lastname: string;
  email: string;
  passwordOne: string;
  passwordTwo: string;
  error: string;
};

const SignUpPage = () => (
  <div>
    <h1>SignUp</h1>
    <SignUpForm />
  </div>
);
//Later on implement a better interface
class SignUpFormBase extends Component<{ firebase: any; history: any }, any> {
  constructor(props: any) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }
  onSubmit = (event: any) => {
    const { username, lastname, email, passwordOne } = this.state;
    const roles = {};

    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then((authUser: any) => {
        // Create a user in your Firebase realtime database
        return this.props.firebase.user(authUser.user.uid).set(
          {
            username,
            lastname,
            email,
            roles,
          },
          { merge: true }
        );
      })
      .then(() => {
        return this.props.firebase.doSendEmailVerification();
      })
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch((error: any) => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      username,
      lastname,
      email,
      passwordOne,
      passwordTwo,
      error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === "" ||
      email === "" ||
      username === "" ||
      lastname === "";

    return (
      <div className="sign-in-container">
        <figure aria-hidden="true">
          <div className="person-body"></div>
          <div className="neck skin"></div>
          <div className="head skin">
            <div className="eyes"></div>
            <div className="mouth mouth-addon"></div>
          </div>
          <div className="hair"></div>
          <div className="ears"></div>
          <div className="shirt-1"></div>
          <div className="shirt-2"></div>
        </figure>
        <form className="sign-form" onSubmit={this.onSubmit}>
          <input
            required
            name="username"
            value={username}
            onChange={this.onChange}
            type="text"
            placeholder="Name"
          />
          <input
            required
            name="lastname"
            value={lastname}
            onChange={this.onChange}
            type="text"
            placeholder="Last Name"
          />
          <input
            required
            name="email"
            value={email}
            onChange={this.onChange}
            type="text"
            placeholder="Email Address"
          />
          <input
            name="passwordOne"
            value={passwordOne}
            onChange={this.onChange}
            type="password"
            placeholder="Password"
          />
          <input
            required
            name="passwordTwo"
            value={passwordTwo}
            onChange={this.onChange}
            type="password"
            placeholder="Confirm Password"
          />
          <input
            type="checkbox"
            name="show-password"
            className="form-check-input show-password a11y-hidden"
            id="show-password"
            tabIndex={3}
          />
          <label className="label-show-password" htmlFor="show-password">
            <span>Show Password</span>
          </label>

          <button disabled={isInvalid} type="submit">
            Sign Up
          </button>

          {error && <p>{error.message}</p>}
        </form>
      </div>
    );
  }
}

const SignUpLink = () => (
  <p className="fontSpec">
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

const SignUpForm = withRouter(withFirebase(SignUpFormBase));
export default SignUpPage;
export { SignUpForm, SignUpLink };
