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
import SignInPage from "../SignIn";
import Modal from "react-bootstrap/Modal";

const NavResult = ({ sessionStore, itemStore }: any) =>
  sessionStore.authUser ? <NavBarComp /> : <NavBarNoAuth />;

class NavBars extends React.Component<
  {
    closePopUp: any;
    show: boolean;
    itemStore: any;
    firebase: any;
    sessionsStore: any;
  },
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      showCartView: false,
    };
  }
  viewCartQuick() {
    this.setState({ showCartView: true });
  }
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

              <Nav.Link
                onClick={() => this.setState({ showCartView: true })}
                data-toggle="modal"
                data-target="#exampleModalLong"
              >
                <FontAwesomeIcon className="fa-lg" icon={faShoppingCart} />
                {this.props.itemStore.itemList.length}
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <div>
          <CartSideBar
            closePopUp={this.viewCartQuick.bind(this)}
            show={this.state.showCartView}
            firebase={this.props.firebase}
            itemStore={this.props.itemStore}
            sessionStore={this.props.sessionsStore}
          />
        </div>
      </div>
    );
  }
}

class NavBarsNoAuth extends React.Component<
  {
    closePopUp: any;
    show: boolean;
    itemStore: any;
    firebase: any;
    sessionsStore: any;
  },
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      showSignIn: false,
      showCartView: false,
    };
  }

  viewNewItemForm() {
    this.setState({
      showSignIn: !this.state.showSignIn,
    });
  }

  viewCartQuick() {
    this.setState({ showCartView: true });
  }

  render() {
    return (
      <div>
        <Navbar className="nav-opacity" expand="lg">
          <Navbar.Brand href="/">Rent-A-Thing</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link onClick={() => this.setState({ showSignIn: true })}>
                Sign In
              </Nav.Link>
            </Nav>
            <Nav className="justify-content-end">
              <div className="alignCart">Cart</div>
              <Nav.Link onClick={() => this.setState({ showCartView: true })}>
                <FontAwesomeIcon className="fa-lg" icon={faShoppingCart} />
                {this.props.itemStore.itemList.length}
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <div>
          {this.state.showSignIn ? (
            <SignInPage
              closePopUp={this.viewNewItemForm.bind(this)}
              show={this.state.showSignIn}
            />
          ) : null}
        </div>
        <div>
          <CartSideBar
            closePopUp={this.viewCartQuick.bind(this)}
            show={this.state.showCartView}
            firebase={this.props.firebase}
            itemStore={this.props.itemStore}
            sessionStore={this.props.sessionsStore}
          />
        </div>
      </div>
    );
  }
}

//const CartStatus = ({ itemStore }: any) => <></>;
class CartSideBar extends React.Component<{
  closePopUp: any;
  show: boolean;
  firebase: any;
  itemStore: any;
  sessionStore: any;
}> {
  constructor(props: any) {
    super(props);
    this.state = {
      showSideBar: false,
    };
    this.handleDates = this.handleDates.bind(this);
    this.doSum = this.doSum.bind(this);
  }

  handleDates(date: any, date2: any) {
    let temp = new Date(date);
    let temp2 = new Date(date2);

    return Math.abs(temp2.valueOf() - temp.valueOf()) / 86400000 + 1;
  }

  doSum() {
    var tempTotal = 0;
    this.props.itemStore.itemList.forEach((data: any) => {
      console.log(new Date(data[2]), data[1]);
      tempTotal += parseInt(data[0].Price) * this.handleDates(data[2], data[1]);
    });
    console.log(tempTotal);
    this.setState({ itemsTot: tempTotal });
    return;
  }

  componentDidMount() {
    this.doSum();
  }

  render() {
    return (
      <>
        <div
          className="modal fade"
          id="exampleModalLong"
          tabIndex={-1}
          role="dialog"
          aria-labelledby="exampleModalLongTitle"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLongTitle">
                  Quick View:Cart
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
              <div className="modal-body"></div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  Order and Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
const NavBarComp = compose(
  withFirebase,
  inject("itemStore"),
  observer
)(NavBars);
const NavBarNoAuth = compose(
  withFirebase,
  inject("itemStore"),
  observer
)(NavBarsNoAuth);

export default compose(
  withFirebase,
  inject("sessionStore"),
  inject("itemStore"),
  observer
)(NavResult);
