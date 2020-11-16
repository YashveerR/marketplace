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
import { faShoppingCart, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { withFirebase } from "../Firebase";
import SignInPage from "../SignIn";
import { v4 as uuidv4 } from "uuid";
import { ColoredLine } from "../Search";
import { withRouter, Link } from "react-router-dom";

const NavResult = ({ sessionStore, itemStore }: any) =>
  sessionStore.authUser ? <NavBarComp /> : <NavBarNoAuth />;

class NavBars extends React.Component<
  {
    closePopUp: any;
    show: boolean;
    itemStore: any;
    firebase: any;
    sessionsStore: any;
    history: any;
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
                <Nav.Link as={Link} to={ROUTES.ACCOUNT}>
                  Account
                </Nav.Link>
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
            history={this.props.history}
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
    history: any;
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
              <Nav.Link
                onClick={() => this.setState({ showSignIn: true })}
                data-toggle="modal"
                data-target="#loginModalLong"
              >
                Sign In
              </Nav.Link>
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
          <SignInPage
            closePopUp={this.viewNewItemForm.bind(this)}
            show={this.state.showSignIn}
          />
        </div>
        <div>
          <CartSideBar
            closePopUp={this.viewCartQuick.bind(this)}
            show={this.state.showCartView}
            firebase={this.props.firebase}
            itemStore={this.props.itemStore}
            sessionStore={this.props.sessionsStore}
            history={this.props.history}
          />
        </div>
      </div>
    );
  }
}

//const CartStatus = ({ itemStore }: any) => <></>;
class CartSideBar extends React.Component<
  {
    closePopUp: any;
    show: boolean;
    firebase: any;
    itemStore: any;
    sessionStore: any;
    history: any;
  },
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      showSideBar: false,
    };
    this.handleDelete = this.handleDelete.bind(this);
    this.handleDates = this.handleDates.bind(this);
    this.doSum = this.doSum.bind(this);
    this.dateString = this.dateString.bind(this);
    this.handleClick = this.handleClick.bind(this);
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

  dateString(dateStr: any) {
    return new Date(dateStr).toDateString();
  }

  handleDelete(event: any) {
    this.props.itemStore.removeItem(event);
    this.doSum();
  }
  componentDidMount() {
    this.doSum();
  }

  handleClick() {
    this.props.history.push("/mycart");
  }

  render() {
    return (
      <>
        <div
          className="modal fade  preview-modal"
          id="exampleModalLong"
          tabIndex={-1}
          role="dialog"
          aria-labelledby="exampleModalLongTitle"
          aria-hidden="true"
          data-backdrop=""
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
              <div className="modal-body">
                {this.props.itemStore.itemList.length > 0 ? (
                  <div>
                    {this.props.itemStore.itemList.map(
                      (data: any, index: number) => {
                        return (
                          <div className="row" key={uuidv4()}>
                            <div key={index} className="col-sm">
                              <img
                                key={uuidv4()}
                                src={data[0].ImgLink0}
                                className="figure-img img-fluid rounded img-cart"
                                alt="cart item"
                              ></img>
                            </div>
                            <div key={uuidv4()} className="col-sm">
                              {data[0].Title}
                            </div>
                            <div key={uuidv4()} className="col-sm">
                              R {data[0].Price}/day
                            </div>
                            <div key={uuidv4()} className="col-sm">
                              From {this.dateString(data[1])} to{" "}
                              {this.dateString(data[2])}
                            </div>
                            <div key={uuidv4()} className="col-sm">
                              <button
                                className="cart-btn btn-danger"
                                onClick={() => this.handleDelete(index)}
                              >
                                <FontAwesomeIcon icon={faTrashAlt} />
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )}
                    <div>
                      <ColoredLine />
                      Total {this.props.itemStore.basketTotal}
                    </div>
                  </div>
                ) : (
                  <div>
                    {" "}
                    Looks Like you do not have items in your cart, go ahead and
                    add some
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => this.handleClick()}
                  className="btn btn-secondary btn-lg active"
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
  withRouter,
  withFirebase,
  inject("itemStore"),
  observer
)(NavBars);
const NavBarNoAuth = compose(
  withRouter,
  withFirebase,
  inject("itemStore"),
  observer
)(NavBarsNoAuth);

export default compose(
  withRouter,
  withFirebase,
  inject("sessionStore"),
  inject("itemStore"),
  observer
)(NavResult);
