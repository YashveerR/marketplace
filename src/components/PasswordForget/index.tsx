import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./pforget.css";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";
import NavResult from "../Navbar";
import { ToastContainer, toast } from "react-toastify";

const PasswordForgetPage = () => (
  <div>
    <PasswordForgetForm />
  </div>
);

const INITIAL_STATE = {
  email: "",
  error: null,
};

class PasswordForgetFormBase extends Component<{ firebase: any }, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      ...INITIAL_STATE,
    };
  }

  onSubmit = (event: any) => {
    const { email } = this.state;
    try {
      if (!this.state["email"]) {
        //error in form blank email
        console.log("email cannot be blank!!");
      } else {
        this.props.firebase
          .doPasswordReset(email)
          .then(() => {
            this.setState({ ...INITIAL_STATE });
            toast.success("Reset Email Sent, Check your Inbox");
          })
          .catch((error: any) => {
            this.setState({ error });
          });

        event.preventDefault();
      }
    } catch (Exception) {
      alert("Error in resetting password");
    }
  };

  onChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, error } = this.state;

    const isInvalid = email === "";

    return (
      <>
        <div className="contain-div">
          <div>
            <NavResult />
          </div>
          <div className="align-centre">
            <div className="header2">Reset Password!</div>
            <ColoredLine />
            <div>
              If accounts exists, instructions will be sent to registered email
            </div>
            <form onSubmit={this.onSubmit}>
              <input
                name="email"
                value={this.state.email}
                onChange={this.onChange}
                type="text"
                placeholder="Email Address"
                className="pforget-input"
              />
              <button
                disabled={isInvalid}
                type="submit"
                className="btn btn-info btn-pwdf"
              >
                Reset My Password
              </button>

              {error && <p>{error.message}</p>}
            </form>
          </div>
          <ToastContainer
            position="bottom-center"
            autoClose={10000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          ></ToastContainer>
        </div>
      </>
    );
  }
}

const ColoredLine = ({ color }: any) => (
  <hr
    style={{
      color: color,
      backgroundColor: color,
      height: 5,
      marginTop: 0,
    }}
  />
);

const PasswordForgetLink = () => (
  <p className="fontSpec">
    <Link to={ROUTES.PASSWORD_FORGET}>Forgot Password?</Link>
  </p>
);

export default PasswordForgetPage;

const PasswordForgetForm = withFirebase(PasswordForgetFormBase);

export { PasswordForgetForm, PasswordForgetLink };
