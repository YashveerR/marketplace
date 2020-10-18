import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import "./signin.css";
import { SignUpLink } from "../SignUp";
import { PasswordForgetLink } from "../PasswordForget";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";

class SignInPage extends React.Component<{ closePopUp: any; show: boolean }> {
  element: any;
  constructor(props: any) {
    super(props);
    this.state = {
      userId: "",
      closeModal: false,
    };
    this.element = React.createRef();
  }

  handlExitPressed() {}

  render() {
    return (
      <div
        className="modal fade preview-modal"
        id="loginModalLong"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="exampleModalLongTitle"
        aria-hidden="true"
        ref={this.element}
        data-backdrop=""
      >
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLongTitle">
                Sign in
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                {" "}
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="containers">
                <div className="row row-remove-flex">
                  <h2 className="h2-style">
                    Login with Social Media or Manually
                  </h2>
                </div>
                <div className="vl">
                  <span className="vl-innertext">or</span>
                </div>
                <div className="col">
                  <SignInFacebook />
                  <SignInTwitter />
                  <SignInGoogle />
                </div>
                <div className="col">
                  <div className="hide-md-lg">
                    <p>Or sign in manually:</p>
                  </div>
                  <SignInForm />
                </div>

                <div className="col">
                  <SignUpLink />
                </div>
                <div className="col">
                  <PasswordForgetLink />
                </div>
              </div>
            </div>
            <div className="modal-footer"></div>
          </div>
        </div>
      </div>
    );
  }
}

const INITIAL_STATE = {
  email: "",
  password: "",
  error: null,
};

const ERROR_CODE_ACCOUNT_EXISTS = "auth/email-already-in-use";

const ERROR_MSG_ACCOUNT_EXISTS = `
  An account with this E-Mail address already exists.
  Try to login with this account instead. If you think the
  account is already used from one of the social logins, try
  to sign in with one of them. Afterward, associate your accounts
  on your personal account page.
`;

class SignInFormBase extends Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event: any) => {
    const { email, password } = this.state;

    console.log("about to sing in ");
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
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
    const { email, password, error } = this.state;

    const isInvalid = password === "" || email === "";

    return (
      <form onSubmit={this.onSubmit}>
        <input
          name="email"
          value={email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address"
        />
        <input
          name="password"
          value={password}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
        />
        <button className="submitBtn btn" disabled={isInvalid} type="submit">
          Sign In
        </button>

        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

class SignInGoogleBase extends Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = { error: null };
  }

  onSubmit = (event: any) => {
    this.props.firebase
      .doSignInWithGoogle()
      .then((socialAuthUser: any) => {
        // Create a user in your Firebase Realtime Database too
        this.props.firebase.user(socialAuthUser.user.uid).set(
          {
            username: socialAuthUser.user.displayName,
            email: socialAuthUser.user.email,
            roles: {},
          },
          { merge: true }
        );
      })
      .then(() => {
        this.setState({ error: null });
        //this.props.history.push(ROUTES.HOME);
      })
      .catch((error: any) => {
        if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
          error.message = ERROR_MSG_ACCOUNT_EXISTS;
        }

        this.setState({ error });
      });

    event.preventDefault();
  };

  render() {
    const { error } = this.state;

    return (
      <form onSubmit={this.onSubmit}>
        <button className="google btn" type="submit">
          <FontAwesomeIcon icon={faGoogle} />
          <i className="newI"></i>
          Sign In with Google
        </button>

        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

class SignInFacebookBase extends Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = { error: null };
  }

  onSubmit = (event: any) => {
    this.props.firebase
      .doSignInWithFacebook()
      .then((socialAuthUser: any) => {
        // Create a user in your Firebase Realtime Database too
        return this.props.firebase.user(socialAuthUser.user.uid).set(
          {
            username: socialAuthUser.additionalUserInfo.profile.name,
            email: socialAuthUser.additionalUserInfo.profile.email,
            roles: {},
          },
          { merge: true }
        );
      })
      .then(() => {
        this.setState({ error: null });
        this.props.history.push(ROUTES.HOME);
      })
      .catch((error: any) => {
        if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
          error.message = ERROR_MSG_ACCOUNT_EXISTS;
        }

        this.setState({ error });
      });

    event.preventDefault();
  };

  render() {
    const { error } = this.state;

    return (
      <form onSubmit={this.onSubmit}>
        <button className="fb btn" type="submit">
          <FontAwesomeIcon icon={faFacebook} />
          <i className="newI"></i>
          Sign In with Facebook
        </button>

        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

class SignInTwitterBase extends Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = { error: null };
  }

  onSubmit = (event: any) => {
    this.props.firebase
      .doSignInWithTwitter()
      .then((socialAuthUser: any) => {
        // Create a user in your Firebase Realtime Database too
        return this.props.firebase.user(socialAuthUser.user.uid).set(
          {
            username: socialAuthUser.additionalUserInfo.profile.name,
            email: socialAuthUser.additionalUserInfo.profile.email,
            roles: {},
          },
          { merge: true }
        );
      })
      .then(() => {
        this.setState({ error: null });
        this.props.history.push(ROUTES.HOME);
      })
      .catch((error: any) => {
        if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
          error.message = ERROR_MSG_ACCOUNT_EXISTS;
        }

        this.setState({ error });
      });

    event.preventDefault();
  };

  render() {
    const { error } = this.state;

    return (
      <form onSubmit={this.onSubmit}>
        <button className=" twitter btn" type="submit">
          <FontAwesomeIcon icon={faTwitter} />
          <i className="newI"></i>
          Sign In with Twitter
        </button>

        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

const SignInForm = compose(withRouter, withFirebase)(SignInFormBase);
const SignInGoogle = compose(withRouter, withFirebase)(SignInGoogleBase);

const SignInFacebook = compose(withRouter, withFirebase)(SignInFacebookBase);

const SignInTwitter = compose(withRouter, withFirebase)(SignInTwitterBase);

export default SignInPage;
export { SignInForm, SignInGoogle, SignInFacebook, SignInTwitter };
