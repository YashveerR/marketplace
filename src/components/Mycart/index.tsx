import React, { Component } from "react";
import { compose } from "recompose";
import { inject, observer } from "mobx-react";
import NavResult from "../Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { withFirebase } from "../Firebase";
import { ToastContainer, toast } from "react-toastify";
import "./mycart.css";

const PROVINCES = [
  "",
  "Gauteng",
  "Kwazulu Natal",
  "Northern Cape",
  "Western Cape",
  "Eastern Cape",
  "Mpumalanga",
  "Limpopo",
  "North West",
  "Free State",
];

const ret_url = "";
const notifi_url = "";

const validEmailRegex = RegExp(
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i // eslint-disable-line
); // eslint-disable-line
const validNumberRegex = RegExp(
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im // eslint-disable-line
);

class MyCart extends Component<
  { firebase: any; itemStore: any; sessionStore: any },
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      cartItems: [],
      itemsTot: 0,
      tempLockId: "",
      userDetails: false,
      classState: ["section is-active ", "section ", "section"],
      classStatusState: ["step active ", "step ", "step"],
      saveAddress: false,
      addrList: [],
      noUser: false,
      validated: false,
      setValidated: false,
      justOrdered: false,
      email: "",
      contact: "",
      firstname: "",
      lastname: "",
      formValids: "form-wrapper frm-wrap-edit needs-validation",
      isError: {
        name: "",
        lastname: "",
        email: "",
        password: "",
        contact: "",
        zipcode: "",
        address_1: "",
        province: "",
        city: "",
        suburb: "",
      },
      hashMd5: "",
      paymentPending: true,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleDates = this.handleDates.bind(this);
    this.doSum = this.doSum.bind(this);
    this.checkOutClick = this.checkOutClick.bind(this);
    this.dateString = this.dateString.bind(this);
    this.formBtnClick = this.formBtnClick.bind(this);

    this.formBtnBackClick = this.formBtnBackClick.bind(this);
    this.checkOnChange = this.checkOnChange.bind(this);
  }

  onChange = (event: any) => {
    let isError = { ...this.state.isError };

    switch (event.target.name) {
      case "firstname":
        isError.name =
          event.target.value.length < 4 ? "At least 4 characters required" : "";
        break;
      case "lastname":
        isError.lastname =
          event.target.value.length < 4 ? "At least 4 characters required" : "";
        break;
      case "email":
        isError.email = validEmailRegex.test(event.target.value)
          ? ""
          : "email invalid";
        break;
      case "contact":
        isError.contact = validNumberRegex.test(event.target.value)
          ? ""
          : "phone number invalid";
        break;
      case "addressLine1":
        isError.address_1 =
          event.target.value.length < 1 ? "Line cannot be blank" : "";
        break;
      case "Province":
        isError.province =
          event.target.value === "Select a Province" ? "Select a Province" : "";

        break;
      case "Suburb":
        isError.suburb =
          event.target.value.length < 4 ? "No suburb entered" : "";
        break;
      case "city":
        isError.city = event.target.value.length < 4 ? "No city entered" : "";
        break;
      case "postalCode":
        isError.zipcode =
          event.target.value.length < 4 ? "Invalid postal code" : "";
        break;
      default:
        break;
    }
    console.log(isError);
    this.setState({
      [event.target.name]: event.target.value,
      isError: isError,
    });
  };
  checkOnChange = (event: any) => {
    var temp: boolean;
    temp = event.target.checked;
    this.setState({ saveAddress: temp });
    console.log(
      "Is this item publi:",
      event.target.checked,
      temp,
      !this.state.saveAddress,
      event.target.value
    );
  };

  dateString(dateStr: any) {
    return new Date(dateStr).toDateString();
  }
  handleDates(date: any, date2: any) {
    let temp = new Date(date);
    let temp2 = new Date(date2);

    return Math.abs(temp2.valueOf() - temp.valueOf()) / 86400000 + 1;
  }

  doSum() {
    var tempTotal = 0;
    this.props.itemStore.itemList.forEach((data: any) => {
      tempTotal += parseInt(data[0].Price) * this.handleDates(data[2], data[1]);
    });
    console.log(tempTotal);
    this.setState({ itemsTot: tempTotal });
    return;
  }

  handleClick(event: any) {
    this.props.itemStore.removeItem(event);
    this.doSum();
  }

  calcPaymentCheckSum() {
    var md5 = require("md5");

    const params = new URLSearchParams({
      merchant_id: "10020541",
      merchant_key: "kki8ne2m55r38",
      return_url: ret_url,
      // cancel_url: "https://yourApplication/paymentscreen",
      notify_url: notifi_url,
      name_first: this.state.firstname,
      name_last: this.state.lastname,
      email_address: this.state.email,
      m_payment_id: this.state.paymentServerId,
      amount: this.props.itemStore.basketTotal,
      item_name: "Test Product",
      //item_description: description_if_any,
      //custom_int1: custome_integer_value_if_any,
      custom_str1: this.state.userId,
      //custom_str2: custome_string_value_if_any,
      passphrase: "2Pn9QerQ11yEPYqLvuGNQ",
    });

    // Create an MD5 signature of it.
    const MD5Signature = md5(params.toString());
    this.setState({ hashMd5: MD5Signature });
  }
  formBtnClick(event: any) {
    //so we got here because we need to advance the form
    const eventSrc = parseInt(event.target.name);
    var temp = [...this.state.classState];
    var temp2 = [...this.state.classStatusState];
    const form = event.currentTarget;
    event.preventDefault();

    if (form.form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      switch (eventSrc) {
        case 0:
          temp[eventSrc] = "section";
          temp[eventSrc + 1] = "section is-active";

          temp2[eventSrc - 1] = "step active";
          break;
        case 1:
          temp[eventSrc] = "section";
          temp[eventSrc + 1] = "section is-active";
          temp2[eventSrc] = "step active";

          this.checkOutClick();
          break;
        case 2:
          //temp[eventSrc] = "section";
          //temp[eventSrc + 1] = "section is-active";
          //temp2[eventSrc] = "step active";

          break;
        case 3: //here is the actual payment stuff!!!! add the API here
          break;
        default:
          break;
      }
      this.setState({ classState: temp });
      this.setState({ classStatusState: temp2 });
      //   const clear_validity = ["", "", "", "", "", "", "", "", "", ""];
      //   this.setState({ isError: clear_validity });
    }
    this.setState({
      formValids: "form-wrapper frm-wrap-edit was-validated",
    });
  }

  formBtnBackClick(event: any) {
    const eventSrc = parseInt(event.target.name);
    var temp = [...this.state.classState];
    var temp2 = [...this.state.classStatusState];
    event.preventDefault();
    switch (eventSrc) {
      case 1:
        //do nothing for this one , or find a way to not show the button at all on 0
        break;
      case 2:
        temp[eventSrc] = "section";
        temp[eventSrc - 1] = "section is-active";
        temp2[eventSrc - 1] = "step";
        console.log("we are in 2");
        break;
      case 3:
        temp[eventSrc] = "section";
        temp[eventSrc - 1] = "section is-active";
        temp2[eventSrc - 1] = "step";
        console.log("we are in 3");
        break;
      case 4: //here is the actual payment stuff!!!! add the API here
        break;
      default:
        break;
    }
    this.setState({ classState: temp });
    this.setState({ classStatusState: temp2 });
  }

  async checkOutClick() {
    let conflict = false;
    let lockIds: any[] = [];
    let tempIds: string[] = [];

    console.log(
      lockIds,
      JSON.parse(window.localStorage.getItem("lockIds") || "{}")
    );
    //I think before checkout we have to have them singUp...and have valid addresses...
    //switch to await promise all here!!!! will help later.
    try {
      this.props.sessionStore.authUser
        ? await this.props.itemStore.itemList.forEach(async (list: any) => {
            await this.props.firebase
              .readDateLocks(list[3])
              .then(async (allItems: any) => {
                await allItems.forEach((data: any) => {
                  //check the dates at the first one break and result in a conflict message
                  const serverStart = new Date(data.data()["start"]);
                  const serverEnd = new Date(data.data()["end"]);
                  if (
                    serverStart.valueOf() >= new Date(list[1]).valueOf() &&
                    serverEnd.valueOf() <= new Date(list[2]).valueOf()
                  ) {
                    conflict = true;
                    toast.error(
                      `Dates Taken for Item: ${list[0].Title} ${
                        list[1].split("T")[0]
                      } ${list[2].split("T")[0]}`
                    );
                  }
                });
              })
              .then(async () => {
                //if we have found no locks for the same item within the date range then add a lock and book
                if (conflict === false) {
                  await this.props.firebase
                    .createTempLock(
                      list[3],
                      new Date(list[1]).toDateString(),
                      new Date(list[2]).toDateString()
                    )
                    .then((doc: any) => {
                      lockIds.push([list[3], doc.id]);
                    });
                  //store to local storage in the event that they navigate from page to the payment portal, this info
                  //will be lost, so save in session and clear upon checkout success.
                  window.localStorage.setItem(
                    "lockIds",
                    JSON.stringify({ lockedItems: lockIds })
                  );
                }
              });
          })
        : toast.info(" Login/Sign Up Required "); //this.props.history.push("/signin");
    } catch (exception) {
      alert("Error in the order.");
    }

    this.props.itemStore.itemList.forEach(async (list: any) => {
      tempIds.push(list[3]);
    });

    if (conflict === false) {
      this.props.firebase
        .createCollatedOrder(
          this.props.firebase.auth.currentUser["uid"],
          tempIds,
          this.state.firstname,
          this.state.lastname,
          this.state.addressLine1,
          this.state.addressLine2,
          this.state.email,
          this.state.contact,
          this.state.Province,
          this.state.city,
          this.state.Suburb,
          this.state.postalCode
        )
        .then((doc: any) => {
          console.log("document id for dummy ", doc.id);
          this.setState({ paymentPending: true });
          this.setState({ paymentServerId: doc.id });
          window.localStorage.setItem("paymentId", doc.id);
        });
    }
  }

  componentDidMount() {
    this.doSum();
    //console.log("uid render", this.props.firebase.auth.currentUser["uid"]);
    try {
      this.props.firebase.auth.onAuthStateChanged((user: any) => {
        if (user) {
          this.props.firebase.doReadSingleDoc(user.uid).then((_doc: any) => {
            this.setState({ name: _doc.data().name });
            this.setState({ lastname: _doc.data().lastname });
            this.setState({ email: _doc.data().email });
            this.setState({ number: _doc.data().number });
            this.setState({ address: _doc.data().address });
            this.setState({ suburb: _doc.data().suburb });
            this.setState({ province: _doc.data().province });
            this.setState({ areacode: _doc.data().areacode });
            this.setState({ terms: _doc.data().terms });
          });

          this.props.firebase
            .readDeliveryAddr(user.uid)
            .then((doc: any) => {
              var tempList: any = [];
              doc.forEach((data: any) => {
                tempList.push(data.data());
                this.setState({ addrList: tempList });
              });
            })
            .then((result: any) => {
              var tempState = [...this.state.classState];
              if (this.state.addrList.length > 0) {
              } else {
                tempState[0] = "section";
                tempState[1] = "section is-active";
                this.setState({ classState: tempState });
              }
            });
          this.setState({ userId: user.uid });
        } else {
          this.setState({ noUser: true });
          toast.error("Please Login to Continue");
        }
      });
    } catch (exception) {
      alert("Error in reading your address information");
    }
  }

  onSubmit = (event: any) => {
    event.preventDefault();
    console.log("In the submit form....");
    this.setState({ setValidated: true });
  };

  render() {
    return (
      <>
        <div className="contain-div">
          <div>
            <NavResult />
          </div>
          {this.props.itemStore.itemList.length > 0 ||
          this.state.justOrdered === true ? (
            <div className="row row-margin">
              <div className="col-md-7 mb-7 ">
                <div className="row ">
                  <div className="col-md-12 mb-12 cart-container">
                    <div className="prog">
                      <div className={this.state.classStatusState[0]}></div>
                      <div className={this.state.classStatusState[1]}></div>
                      <div className={this.state.classStatusState[2]}></div>
                      <div className={this.state.classStatusState[3]}></div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <form
                    className={this.state.formValids}
                    noValidate
                    action="https://sandbox.payfast.co.za​/eng/process"
                    method="post"
                  >
                    {this.state.addrList.length > 0 ? (
                      <fieldset className={this.state.classState[0]}>
                        <h3>Select Delivery Address</h3>
                      </fieldset>
                    ) : null}
                    <fieldset className={this.state.classState[1]}>
                      <h3>Delivery Information</h3>
                      <div className="row">
                        <div className="col-md-4 mb-4">
                          <div className="form-group mb-4">
                            <input
                              required
                              type="text"
                              className={
                                this.state.isError.name.length > 0
                                  ? "is-invalid form-control"
                                  : "form-control"
                              }
                              onChange={this.onChange}
                              placeholder="First Name"
                              aria-label="firstName"
                              aria-describedby="basic-addon1"
                              id="firstName"
                              name="firstname"
                            ></input>
                            <div className="invalid-feedback">
                              Error for name!{this.state.isError.name}
                            </div>
                          </div>
                          <div className="input-group mb-4">
                            <input
                              required
                              type="text"
                              id="email"
                              name="email"
                              onChange={this.onChange}
                              placeholder="lukeskywalker@etc.com"
                              className={
                                this.state.isError.email.length > 0
                                  ? "is-invalid form-control"
                                  : "form-control"
                              }
                              aria-label="firstName"
                              aria-describedby="basic-addon1"
                            ></input>
                            <div className="invalid-feedback">
                              Email address invalid
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4 mb-4">
                          <div className="input-group mb-4">
                            {" "}
                            <input
                              required
                              type="text"
                              id="lastname"
                              name="lastname"
                              onChange={this.onChange}
                              placeholder="Last Name"
                              className={
                                this.state.isError.lastname.length > 0
                                  ? "is-invalid form-control"
                                  : "form-control"
                              }
                              aria-label="firstName"
                              aria-describedby="basic-addon1"
                            ></input>
                            <div className="invalid-feedback">
                              Error for lastname! {this.state.isError.lastname}
                            </div>
                          </div>
                          <div className="input-group mb-4">
                            <input
                              required
                              type="text"
                              id="contact"
                              name="contact"
                              onChange={this.onChange}
                              placeholder="0831234567"
                              className={
                                this.state.isError.contact.length > 0
                                  ? "is-invalid form-control"
                                  : "form-control"
                              }
                              aria-label="firstName"
                              aria-describedby="basic-addon1"
                            ></input>
                            <div className="invalid-feedback">
                              Error with phone number!
                              {this.state.isError.contact}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-8 mb-8">
                          <input
                            required
                            type="text"
                            id="addressLine1"
                            name="addressLine1"
                            onChange={this.onChange}
                            placeholder="Your Address Here"
                            className={
                              this.state.isError.email.adress_1 > 0
                                ? "is-invalid form-control"
                                : "form-control"
                            }
                            aria-label="firstName"
                            aria-describedby="basic-addon1"
                          ></input>
                          <div className="invalid-feedback">
                            Address error!{this.state.isError.address_1}
                          </div>
                          <input
                            type="text"
                            id="addressLine2"
                            name="addressLine2"
                            onChange={this.onChange}
                            placeholder="Extra Address Space"
                            className="form-control"
                            aria-label="firstName"
                            aria-describedby="basic-addon1"
                          ></input>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-4 mb-4">
                          <div className="input-group mb-4">
                            {" "}
                            <select
                              required
                              className={
                                this.state.isError.province > 0
                                  ? "is-invalid custom-select frm-drp-dwn"
                                  : "custom-select frm-drp-dwn"
                              }
                              id="Province"
                              name="Province"
                              onChange={this.onChange}
                              placeholder="Select Province"
                            >
                              {PROVINCES.map((data: string, index: number) => {
                                return <option key={index}> {data}</option>;
                              })}
                            </select>
                            <div className="invalid-feedback">
                              No Province selected!
                              {this.state.isError.province}
                            </div>
                          </div>
                          <div className="input-group mb-4">
                            <input
                              required
                              type="text"
                              id="city"
                              name="city"
                              onChange={this.onChange}
                              placeholder="Your City"
                              className={
                                this.state.isError.email.suburb > 0
                                  ? "is-invalid form-control"
                                  : "form-control"
                              }
                              aria-label="firstName"
                              aria-describedby="basic-addon1"
                            ></input>
                            <div className="invalid-feedback">
                              Error with city!
                              {this.state.isError.city}
                            </div>
                          </div>
                          <div className="input-group mb-4">
                            <input
                              name="saveAddress"
                              className="form-check-input check-box-edit"
                              type="checkbox"
                              id="defaultCheck1"
                              onChange={this.checkOnChange}
                            ></input>
                            <label
                              className="form-check-label check-lbl-edit"
                              htmlFor="defaultCheck1"
                            >
                              Save address to Profile?
                            </label>
                          </div>
                        </div>
                        <div className="col-md-4 mb-4">
                          <div className="input-group mb-4">
                            {" "}
                            <input
                              required
                              type="text"
                              id="Suburb"
                              name="Suburb"
                              onChange={this.onChange}
                              placeholder="Your Suburb"
                              className={
                                this.state.isError.email.suburb > 0
                                  ? "is-invalid form-control"
                                  : "form-control"
                              }
                              aria-label="firstName"
                              aria-describedby="basic-addon1"
                            ></input>
                            <div className="invalid-feedback">
                              Error with suburb!
                              {this.state.isError.suburb}
                            </div>
                          </div>
                          <div className="input-group mb-4">
                            <input
                              required
                              type="text"
                              id="postalCode"
                              name="postalCode"
                              onChange={this.onChange}
                              placeholder="2413"
                              className={
                                this.state.isError.email.zipcode > 0
                                  ? "is-invalid form-control"
                                  : "form-control"
                              }
                              aria-label="firstName"
                              aria-describedby="basic-addon1"
                            ></input>
                            <div className="invalid-feedback">
                              Error with zip code!
                              {this.state.isError.contact}
                            </div>
                            {this.state.saveAddress ? (
                              <div className="input-group mb-4">
                                <input
                                  required
                                  type="text"
                                  id="addrNick"
                                  name="addrNick"
                                  onChange={this.onChange}
                                  placeholder="Friendly Nickname"
                                  className="form-control"
                                  aria-label="firstName"
                                  aria-describedby="basic-addon1"
                                ></input>
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        className="button"
                        name="1"
                        onClick={this.formBtnClick}
                      >
                        Next
                      </button>
                    </fieldset>
                    <fieldset className={this.state.classState[2]}>
                      {" "}
                      <h3>Secure Checkout</h3>
                      <div className="payments-method">
                        <label htmlFor="card" className="method card">
                          <div className="card-logos">
                            <img
                              src="https://www.payfast.co.za/assets/images/payfast_logo_colour.svg"
                              alt="payfast logo"
                            />
                            <img
                              src="https://designmodo.com/demo/checkout-panel/img/mastercard_logo.png"
                              alt="mastercardlogo"
                            />
                          </div>

                          <div className="radio-input">
                            <input
                              id="card"
                              type="radio"
                              name="payment"
                            ></input>
                            Pay R{this.props.itemStore.basketTotal} with credit
                            card
                          </div>
                        </label>

                        <label htmlFor="paypal" className="method paypal">
                          <img
                            src="https://www.payfast.co.za/assets/images/instant-erf-header.png"
                            alt="paypal logo"
                          />
                          <div className="radio-input">
                            <input
                              id="paypal"
                              type="radio"
                              name="payment"
                            ></input>
                            Pay R{this.props.itemStore.basketTotal} with PayFast
                            Instant EFT
                          </div>
                        </label>
                      </div>
                      <input
                        type="hidden"
                        name="merchant_id"
                        value={10020541}
                      ></input>
                      <input
                        type="hidden"
                        name="merchant_key"
                        value="kki8ne2m55r38"
                      ></input>
                      <input type="hidden" name="return_url" value={ret_url} />
                      <input
                        type="hidden"
                        name="notify_url"
                        value={notifi_url}
                      />
                      <input
                        type="hidden"
                        name="name_first"
                        value={this.state.firstname || ""}
                      ></input>
                      <input
                        type="hidden"
                        name="name_last"
                        value={this.state.lastname || ""}
                      ></input>
                      <input
                        type="hidden"
                        name="email_address"
                        value={this.state.email || ""}
                      ></input>
                      <input
                        type="hidden"
                        name="m_payment_id"
                        value={this.state.paymentServerId || ""}
                      ></input>
                      <input
                        type="hidden"
                        name="amount"
                        value={this.props.itemStore.basketTotal}
                      ></input>
                      <input
                        type="hidden"
                        name="item_name"
                        value="Test Product"
                      ></input>
                      <input
                        type="hidden"
                        name="custom_str1"
                        value={this.state.userId || ""}
                      ></input>
                      <input
                        type="hidden"
                        name="passphrase"
                        value={process.env.REACT_APP_PAYFAST_PASSPHRASE || ""}
                      />
                      <input
                        type="hidden"
                        name="signature"
                        value={this.state.hashMd5 || ""}
                      />
                      <button className="button" name="2" type="submit">
                        <FontAwesomeIcon icon={faCreditCard} />
                        Pay Now
                      </button>
                      <button
                        className="button-back"
                        name="2"
                        onClick={this.formBtnBackClick}
                      >
                        Back
                      </button>
                    </fieldset>
                  </form>
                </div>
              </div>
              <div className="col-md-1 mb-1"></div>
              <div className="col-md-4 mb-4 cart-container">
                This is for the Price stuff
                {this.props.itemStore.itemList.map(
                  (data: any, index: number) => {
                    return (
                      <div key={index} className="row srwedit">
                        <div key={index} className=" text-class">
                          {data[0].Title} {data[0].Price} {}{" "}
                          {this.dateString(data[1])} {this.dateString(data[2])}{" "}
                          {this.handleDates(data[1], data[2])}
                          <button
                            className="cart-btn btn-danger"
                            onClick={() => this.handleClick(index)}
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
                <div>Total: R {this.props.itemStore.basketTotal}</div>
              </div>
            </div>
          ) : (
            <div>
              <h3>Hmmmmm... No Items in your cart? Time to get some? </h3>{" "}
            </div>
          )}
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
      </>
    );
  }
}
//const condition = (authUser: any) => !!authUser;
export default compose(
  inject("sessionStore"),
  withFirebase,
  //withAuthentication,
  //withAuthorization(condition),
  inject("itemStore"),
  observer
)(MyCart);
