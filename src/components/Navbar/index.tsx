import React from "react";
import NavDropdown from "react-bootstrap/NavDropdown";
import Nav from "react-bootstrap/Nav";
import * as ROUTES from "../../constants/routes";
import Navbar from "react-bootstrap/Navbar";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import SignOutButton from "../SignOut";
import "./navbar.css";

const NavResult = ({ sessionStore }: any) =>
  sessionStore.authUser ? <NavBarComp /> : <NavBarNoAuth />;

const NavBarComp = ({ firebase, authUser }: any) => (
  <div>
    <Navbar className="nav-opacity" expand="lg">
      <Navbar.Brand href="/">Rent-A-Thing</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="/myitems">My Items</Nav.Link>
          <NavDropdown title="My Account" id="basic-nav-dropdown">
            <NavDropdown.Item href="#action/3.1">
              Rental history
            </NavDropdown.Item>
            <NavDropdown.Item href={ROUTES.ACCOUNT}>Account</NavDropdown.Item>
            <NavDropdown.Divider />
            <SignOutButton />
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  </div>
);

const NavBarNoAuth = () => (
  <div>
    <Navbar className="nav-opacity" expand="lg">
      <Navbar.Brand href="/">Rent-A-Thing</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav.Link href="/rentout">Rent Out Item?</Nav.Link>
        <Nav.Link href={ROUTES.SIGN_IN}>Sign In</Nav.Link>
      </Navbar.Collapse>
    </Navbar>
  </div>
);

export default compose(inject("sessionStore"), observer)(NavResult);
