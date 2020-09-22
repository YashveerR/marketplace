import React from "react";
import NavDropdown from "react-bootstrap/NavDropdown";
import Nav from "react-bootstrap/Nav";
import * as ROUTES from "../../constants/routes";
import Navbar from "react-bootstrap/Navbar";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import SignOutActs from "../SignOut";
import "./navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { withFirebase } from "../Firebase";

const NavResult = ({ sessionStore, itemStore }: any) =>
  sessionStore.authUser ? <NavBarComp /> : <NavBarNoAuth />;

class NavBars extends React.Component<any, any> {
  render() {
    return (
      <div>
        <Navbar className="nav-opacity" expand="lg">
          <Navbar.Brand href="/">Rent-A-Thing</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="/myitems">My Items</Nav.Link>
              <NavDropdown title="My Account" id="basic-nav-dropdown">
                <NavDropdown.Item href={ROUTES.ACCOUNT}>
                  Account
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <SignOutActs />
              </NavDropdown>
            </Nav>
            <Nav className="justify-content-end">
              <div className="alignCart">Cart</div>

              <Nav.Link href="/mycart">
                <FontAwesomeIcon className="fa-lg" icon={faShoppingCart} />
                {this.props.itemStore.itemList.length}
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }
}

class NavBarsNoAuth extends React.Component<any, any> {
  render() {
    return (
      <div>
        <Navbar className="nav-opacity" expand="lg">
          <Navbar.Brand href="/">Rent-A-Thing</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href={ROUTES.SIGN_IN}>Sign In</Nav.Link>
            </Nav>
            <Nav className="justify-content-end">
              <div className="alignCart">Cart</div>
              <Nav.Link href="/mycart">
                <FontAwesomeIcon className="fa-lg" icon={faShoppingCart} />
                {this.props.itemStore.itemList.length}
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }
}

//const CartStatus = ({ itemStore }: any) => <></>;

const NavBarComp = compose(inject("itemStore"), observer)(NavBars);
const NavBarNoAuth = compose(inject("itemStore"), observer)(NavBarsNoAuth);
export default compose(
  withFirebase,
  inject("sessionStore"),
  inject("itemStore"),
  observer
)(NavResult);
