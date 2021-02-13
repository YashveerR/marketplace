import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import "./account.css";
import { withAuthorization, withEmailVerification } from "../Session";
import { withFirebase } from "../Firebase";
import { ACCINFO } from "../../constants/menuItems";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import MyItems from "../MyItems";
import MyOrders from "../MyOrders";
import MyRentals from "../MyRentals";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import CartSideBar from "../CartPopUp";
import { ToastContainer, toast } from "react-toastify";

class AccountPage extends Component<
  { firebase: any; itemStore: any; sessionStore: any; history: any },
  any
> {
  selectedOption: any;
  elementDisplay: any;

  constructor(props: any) {
    super(props);
    this.selectedOption = 0;

    this.state = {
      viewform: false,
      terms: false,
    };
    this.handleClick = this.handleClick.bind(this);
    this.switchView = this.switchView.bind(this);
    this.elementDisplay = "Please Select an Option to view";
  }

  handleClick(index: any) {
    this.selectedOption = index;
    this.switchView();
  }

  viewCartQuick() {
    this.setState({ showCartView: true });
  }

  switchView() {
    switch (this.selectedOption) {
      case 0:
        this.elementDisplay = (
          <div>
            <AccountInfo />
          </div>
        );
        break;
      case 1:
        this.elementDisplay = (
          <div>
            <MyOrders />
          </div>
        );
        break;
      case 2:
        this.elementDisplay = <MyItems />;
        break;
      case 3:
        this.elementDisplay = <MyRentals />;
        break;
      default:
        this.elementDisplay = <div>BROKEN</div>;
        break;
    }
    this.setState({ viewform: true });
  }

  render() {
    return (
      <div className="container-2">
        <Navbar className="nav-opacity" expand="lg">
          <Navbar.Brand href="/">Rent-A-Thing</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              {ACCINFO.map((item, i) => {
                return (
                  <Nav.Link
                    key={i.toString()}
                    onClick={() => this.handleClick(i)}
                  >
                    {item}
                  </Nav.Link>
                );
              })}
            </Nav>
            <Nav className="justify-content-end">
              <div className="alignCart">Cart</div>
              <Nav.Link
                onClick={() => this.setState({ showCartView: true })}
                data-toggle="modal"
                data-target="#cartModal"
              >
                <FontAwesomeIcon className="fa-lg" icon={faShoppingCart} />
                {this.props.itemStore.itemList.length}
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <div>
          <CartSideBar />
        </div>
        {this.state.viewform ? this.elementDisplay : ""}
      </div>
    );
  }
}

class AccountInfoPage extends Component<{ firebase: any }, any> {
  constructor(props: any) {
    super(props);

    //make this into an object
    this.state = {
      email: "",
      name: "",
      lastname: "",
      number: "",
      address: "",
      suburb: "",
      province: "",
      areacode: "",
      terms: false,
    };
  }
  componentDidMount() {
    try {
      this.props.firebase
        .doReadSingleDoc(this.props.firebase.auth.currentUser["uid"])
        .then((_doc: any) => {
          this.setState({ name: _doc.data().name });
          this.setState({ lastname: _doc.data().lastname });
          this.setState({ email: _doc.data().email });

          if (_doc.data().address_list !== undefined) {
            this.setState({ number: _doc.data().number });
            this.setState({ address: _doc.data().address_list[0].addr1 });
            this.setState({ address2: _doc.data().address_list[0].addr2 });
            this.setState({ city: _doc.data().address_list[0].city });
            this.setState({ suburb: _doc.data().address_list[0].sub });
            this.setState({ province: _doc.data().address_list[0].province });
            this.setState({ areacode: _doc.data().address_list[0].zip });
          }
          if (_doc.data().terms === "") this.setState({ terms: false });
          else this.setState({ terms: _doc.data().terms });
        });
    } catch (exception) {
      alert("An error has occured fetching data :(");
    }
  }

  onSubmit = (event: any) => {
    try {
      event.preventDefault();
      if (this.state.terms === false) {
        toast.error("Terms and Conditions are not accepted");
      } else {
        const addr_obj = {
          addr1: this.state.address,
          addr2: this.state.address2,
          sub: this.state.suburb,
          province: this.state.province,
          city: this.state.city,
          zip: this.state.areacode,
          friendlyName: "Home",
        };
        this.props.firebase.doUpdateUser(
          this.props.firebase.auth.currentUser["uid"],
          this.state.name,
          this.state.lastname,
          this.state.email,
          this.state.number,
          addr_obj,
          this.state.terms
        );
      }
    } catch (exception) {
      console.log(exception);
    }
  };
  onChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    return (
      <div className="form-height">
        <form className="form-height" onSubmit={this.onSubmit}>
          <div className="form-row">
            <div className="col-md-4 mb-3 text-class">
              <label htmlFor="validationDefault01">First name</label>
              <input
                name="name"
                type="text"
                className="form-control inputs-adjust "
                id="validationDefault01"
                placeholder="First name"
                required
                onChange={this.onChange}
                value={this.state.name || ""}
              ></input>
            </div>
            <div className="col-md-4 mb-3 text-class">
              <label htmlFor="validationDefault02">Last name</label>
              <input
                name="lastname"
                type="text"
                className="form-control inputs-adjust "
                id="validationDefault02"
                placeholder="Last name"
                required
                onChange={this.onChange}
                value={this.state.lastname || ""}
              ></input>
            </div>
          </div>
          <div className="form-row">
            <div className="col-md-4 mb-3 text-class">
              <label htmlFor="validationDefaultUsername">Email</label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text" id="inputGroupPrepend2">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </span>
                </div>
                <input
                  name="email"
                  type="text"
                  className="form-control inputs-adjust "
                  id="validationDefaultUsername"
                  placeholder="Email"
                  aria-describedby="inputGroupPrepend2"
                  required
                  onChange={this.onChange}
                  value={this.state.email || ""}
                ></input>
              </div>
            </div>
            <div className="col-md-4 mb-3 text-class">
              <label htmlFor="validationDefault03">Contact Number</label>
              <input
                name="number"
                type="text"
                className="form-control inputs-adjust "
                id="validationDefault03"
                pattern="[0-9]{10}"
                placeholder="0123456789"
                required
                onChange={this.onChange}
                value={this.state.number || ""}
              ></input>
            </div>
          </div>
          <div className="form-row">
            <div className="col-md-4 mb-3 text-class">
              <label htmlFor="validationDefault03">Address Line</label>
              <input
                name="address"
                type="text"
                className="form-control inputs-adjust "
                id="validationDefault03"
                placeholder="Address"
                required
                onChange={this.onChange}
                value={this.state.address || ""}
              ></input>
            </div>
            <div className="col-md-4 mb-3 text-class">
              <label htmlFor="validationDefault04">Address Line Two</label>
              <input
                name="address2"
                type="text"
                className="form-control inputs-adjust "
                id="validationDefault04"
                placeholder="Address line two"
                required
                onChange={this.onChange}
                value={this.state.address2 || ""}
              ></input>
            </div>
          </div>
          <div className="form-row">
            <div className="col-md-4 mb-3 text-class">
              <label htmlFor="validationDefault04">Province</label>
              <input
                name="province"
                type="text"
                className="form-control inputs-adjust "
                id="validationDefault04"
                placeholder="Province"
                required
                onChange={this.onChange}
                value={this.state.province || ""}
              ></input>
            </div>
            <div className="col-md-4 mb-3 text-class">
              <label htmlFor="validationDefault04">City</label>
              <input
                name="city"
                type="text"
                className="form-control inputs-adjust "
                id="validationDefault04"
                placeholder="City"
                required
                onChange={this.onChange}
                value={this.state.city || ""}
              ></input>
            </div>
          </div>
          <div className="form-row">
            <div className="col-md-4 mb-3 text-class">
              <label htmlFor="validationDefault04">Suburb</label>
              <input
                name="suburb"
                type="text"
                className="form-control inputs-adjust "
                id="validationDefault04"
                placeholder="Suburb"
                required
                onChange={this.onChange}
                value={this.state.suburb || ""}
              ></input>
            </div>
            <div className="col-md-4 mb-3 text-class">
              <label htmlFor="validationDefault05">Area Code</label>
              <input
                name="areacode"
                type="text"
                pattern="[0-9]{4}"
                className="form-control inputs-adjust "
                id="validationDefault05"
                placeholder="Area Code"
                required
                onChange={this.onChange}
                value={this.state.areacode || ""}
              ></input>
            </div>
          </div>
          <div className="form-group form-check">
            {this.state.terms === "on" ? (
              <div className="text-class">Terms and Conditions accepted.</div>
            ) : (
              <div className="form-check">
                <input
                  name="terms"
                  type="checkbox"
                  className="form-check-input btn-submit"
                  id="invalidCheck2"
                  onChange={() => {}}
                  onClick={() => this.setState({ terms: !this.state.terms })}
                  checked={this.state.terms || ""}
                ></input>
                <label
                  className="form-check-label checkbox-text"
                  htmlFor="invalidCheck2"
                >
                  Accept Terms and Conditions
                </label>
              </div>
            )}
          </div>
          <button className="btn btn-primary btn-submit" type="submit">
            Submit Information
          </button>
        </form>
        <ToastContainer
          position="top-center"
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
    );
  }
}

//const LoginManagement = withFirebase(LoginManagementBase);
const AccountInfo = withFirebase(AccountInfoPage);

const condition = (authUser: any) => !!authUser;

export default compose(
  inject("sessionStore"),
  inject("itemStore"),
  observer,
  withEmailVerification,
  withAuthorization(condition)
)(AccountPage);
