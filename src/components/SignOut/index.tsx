import React, { Component } from "react";
import NavDropdown from "react-bootstrap/NavDropdown";
import { withFirebase } from "../Firebase";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import "./signout.css";

class SignOutActs extends Component<{ firebase: any; itemStore: any }, any> {
  constructor(props: any) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.firebase.doSignOut();
    this.props.itemStore.empty();
  }

  render() {
    return (
      <>
        <NavDropdown.Item onClick={this.handleClick} eventKey="info">
          Logout
        </NavDropdown.Item>
      </>
    );
  }
}

export default compose(
  withFirebase,
  inject("itemStore"),
  observer
)(SignOutActs);
