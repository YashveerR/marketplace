import React, { Component } from "react";
import { compose } from "recompose";
import { inject, observer } from "mobx-react";
import NavResult from "../Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { withFirebase } from "../Firebase";
import { ToastContainer, toast } from "react-toastify";
import "./mycart.css";
const ORDERED = "ordered";

const PROVINCES = [
  "Select a Province",
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
      classState: ["section is-active", "section", "section"],
      classStatusState: ["step active", "step", "step", "step"],
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleDates = this.handleDates.bind(this);
    this.doSum = this.doSum.bind(this);
    this.checkOutClick = this.checkOutClick.bind(this);
    this.dateString = this.dateString.bind(this);
    this.formBtnClick = this.formBtnClick.bind(this);
    this.simulateCO = this.simulateCO.bind(this);
    this.formBtnBackClick = this.formBtnBackClick.bind(this);
  }

  simulateCO() {
    toast.success("Yay! You Have successfully bought an item...");
    const newLocal = JSON.parse(window.localStorage.getItem("lockIds") || "{}");
    let storeInt = newLocal;
    //TODO: complete add item in users queue
    //TODO: execute a firestore function to send an email confirmation of order etc. etc. etc.
    try {
      this.props.itemStore.itemList.forEach((listedItems: any) => {
        this.props.firebase
          .createRentedDate(
            listedItems[3],
            new Date(listedItems[1]),
            new Date(listedItems[2])
          )
          .then((invoiceId: any) => {
            this.props.firebase.createOwnerOrder(
              listedItems[0].author,
              this.props.firebase.auth.currentUser["uid"],
              invoiceId.id,
              ORDERED,
              listedItems[0].Title,
              new Date(listedItems[1]),
              new Date(listedItems[2]),
              listedItems[3]
            );
            this.props.firebase.createMyOrder(
              this.props.firebase.auth.currentUser["uid"],
              listedItems[3],
              invoiceId.id,
              new Date(listedItems[1]),
              new Date(listedItems[2]),
              ORDERED
            );
            this.props.firebase.createChatLink(
              listedItems[0].author,
              this.props.firebase.auth.currentUser["uid"],
              invoiceId.id
            );
          });
      });
    } catch (exception) {
      console.log("Error in creating order");
    }

    storeInt.lockedItems.forEach((data: any) => {
      try {
        this.props.firebase.deleteDateLocks(data[0], data[1]);
      } catch (exception) {
        alert("Hmmmm... couldn't delete temporary reservation");
      }
    });

    try {
    } catch (exception) {}

    //
    this.removeLocalStorage();
    this.props.itemStore.empty();
    this.setState({ itemsTot: 0 });
  }

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

  formBtnClick(event: any) {
    //so we got here because we need to advance the form
    const eventSrc = parseInt(event.target.name);
    var temp = [...this.state.classState];
    var temp2 = [...this.state.classStatusState];

    switch (eventSrc) {
      case 0:
        temp[eventSrc] = "section";
        temp[eventSrc + 1] = "section is-active";

        temp2[eventSrc + 1] = "step active";
        break;
      case 1:
        temp[eventSrc] = "section";
        temp[eventSrc + 1] = "section is-active";
        temp2[eventSrc + 1] = "step active";
        break;
      case 2:
        temp[eventSrc] = "section";
        temp[eventSrc + 1] = "section is-active";
        temp2[eventSrc + 1] = "step active";
        break;
      case 3: //here is the actual payment stuff!!!! add the API here
        break;
      default:
        break;
    }
    this.setState({ classState: temp });
    this.setState({ classStatusState: temp2 });
  }

  formBtnBackClick(event: any) {
    const eventSrc = parseInt(event.target.name);
    var temp = [...this.state.classState];
    var temp2 = [...this.state.classStatusState];
    switch (eventSrc) {
      case 0:
        //do nothing for this one , or find a way to not show the button at all on 0
        break;
      case 1:
        temp[eventSrc] = "section";
        temp[eventSrc - 1] = "section is-active";
        temp2[eventSrc] = "step";
        break;
      case 2:
        temp[eventSrc] = "section";
        temp[eventSrc - 1] = "section is-active";
        temp2[eventSrc] = "step";
        break;
      case 3: //here is the actual payment stuff!!!! add the API here
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

    console.log(
      lockIds,
      JSON.parse(window.localStorage.getItem("lockIds") || "{}")
    );
    //I think before checkout we have to have them singUp...and have valid addresses...
    try {
      this.props.sessionStore.authUser
        ? this.props.itemStore.itemList.forEach((list: any) => {
            this.props.firebase
              .readDateLocks(list[3])
              .then((allItems: any) => {
                allItems.forEach((data: any) => {
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
    //call checkout stuff here, on success clear cart and local storage and start the communications
    //workflow....the correct way to do these would be to create nice objects instead of these
    //silly array indices which for all intensive purposes have no meaning here..... tisk tisk!!!!!
    //THIS GOES FOR ALL PLACES YOU USE THESE RUBBISH!!!!!!!!!
    /*
    toast.success("Yay! You Have successfully bought an item...");

    this.props.itemStore.itemList.map((listedItems: any) => {
      this.props.firebase.createRentedDate(
        listedItems[3],
        new Date(listedItems[1]).toDateString(),
        new Date(listedItems[2]).toDateString()
      );
    });
    //this.removeLocalStorage();
    */
  }

  removeLocalStorage() {
    window.localStorage.removeItem("lockIds");
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
        }
      });
    } catch (exception) {
      alert("Error in reading your address information");
    }
  }

  onSubmit = (event: any) => {
    event.preventDefault();
  };

  render() {
    return (
      <>
        <div className="contain-div">
          <div>
            <NavResult />
          </div>
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
                  className="form-wrapper frm-wrap-edit"
                  onSubmit={this.onSubmit}
                >
                  <fieldset className={this.state.classState[0]}>
                    <h3>Billing Information</h3>
                    <div className="row">
                      <div className="col-md-4 mb-4">
                        <input
                          type="text"
                          id="userName"
                          placeholder="First Name"
                        ></input>
                        <input
                          type="text"
                          id="email"
                          placeholder="lukeskywalker@etc.com"
                        ></input>
                      </div>
                      <div className="col-md-4 mb-4">
                        <input
                          type="text"
                          id="lastName"
                          placeholder="Last Name"
                        ></input>
                        <input
                          type="text"
                          id="contact"
                          placeholder="0831234567"
                        ></input>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-8 mb-8">
                        <input
                          type="text"
                          id="addressLine1"
                          placeholder="Your Address Here"
                        ></input>
                        <input
                          type="text"
                          id="addressLine2"
                          placeholder=""
                        ></input>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4 mb-4">
                        <select
                          className="custom-select"
                          id="Province"
                          placeholder="Your Address Here"
                        >
                          {PROVINCES.map((data: string, index: number) => {
                            return <option key={index}> {data}</option>;
                          })}
                        </select>
                        <input
                          type="text"
                          id="Suburb"
                          placeholder="Your Suburb/Town"
                        ></input>
                      </div>
                      <div className="col-md-4 mb-4">
                        <input
                          type="text"
                          id="city"
                          placeholder="Your City/Suburb"
                        ></input>
                        <input
                          type="text"
                          id="postalCode"
                          placeholder="2413"
                        ></input>
                      </div>
                    </div>

                    <button
                      className="button"
                      name="0"
                      onClick={this.formBtnClick}
                    >
                      Next
                    </button>
                  </fieldset>
                  <fieldset className={this.state.classState[1]}>
                    {" "}
                    <h3>Account Type</h3>
                    <button
                      className="button"
                      name="1"
                      onClick={this.formBtnClick}
                    >
                      Next
                    </button>
                    <button
                      className="button-back"
                      name="1"
                      onClick={this.formBtnBackClick}
                    >
                      Back
                    </button>
                  </fieldset>
                  <fieldset className={this.state.classState[2]}>
                    <h3>Choose a Password</h3>
                    <div className="button">Nothing Next...</div>
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
              {this.props.itemStore.itemList.map((data: any, index: number) => {
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
              })}
              <div>Total: R {this.props.itemStore.basketTotal}</div>
              <div>
                <button onClick={this.checkOutClick}>
                  <FontAwesomeIcon icon={faCreditCard} />
                  Place Order
                </button>
              </div>
              <div>
                <button onClick={this.simulateCO}>
                  <FontAwesomeIcon icon={faCreditCard} />
                  Simulate Return from Payments
                </button>
              </div>
            </div>
          </div>
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
