import React from "react";
import NavDropdown from "react-bootstrap/NavDropdown";
import { withFirebase } from "../Firebase";
import "./signout.css";

const SignOutButton = ({ firebase }: any) => (
  <NavDropdown.Item onClick={firebase.doSignOut} eventKey="info">
    Logout
  </NavDropdown.Item>
);

export default withFirebase(SignOutButton);
