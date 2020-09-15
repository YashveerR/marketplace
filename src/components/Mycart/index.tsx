import React, { Component } from "react";
import { compose } from "recompose";
import { inject, observer } from "mobx-react";
import NavResult from "../Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { withFirebase } from "../Firebase";
import { ToastContainer, toast } from "react-toastify";
import { withAuthorization, withAuthentication } from "../Session";

const ORDERED = "ordered";

class MyCart extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      cartItems: [],
      itemsTot: 0,
      tempLockId: "",
      userDetails: false,
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleDates = this.handleDates.bind(this);
    this.doSum = this.doSum.bind(this);
    this.checkOutClick = this.checkOutClick.bind(this);
    this.dateString = this.dateString.bind(this);

    this.simulateCO = this.simulateCO.bind(this);
  }

  simulateCO() {
    toast.success("Yay! You Have successfully bought an item...");
    const newLocal = JSON.parse(window.localStorage.getItem("lockIds") || "{}");
    let storeInt = newLocal;
    //TODO: complete add item in users queue
    //TODO: execute a firestore function to send an email confirmation of order etc. etc. etc.
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
            listedItems[1],
            listedItems[2]
          );
          this.props.firebase.createMyOrder(
            this.props.firebase.auth.currentUser["uid"],
            listedItems[3],
            invoiceId.id,
            listedItems[1],
            listedItems[2],
            ORDERED
          );
        });
    });

    storeInt.lockedItems.forEach((data: any) => {
      this.props.firebase.deleteDateLocks(data[0], data[1]);
    });

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
      console.log(new Date(data[2]), data[1]);
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

  async checkOutClick() {
    let conflict = false;
    let lockIds: any[] = [];

    console.log(
      lockIds,
      JSON.parse(window.localStorage.getItem("lockIds") || "{}")
    );
    //I think before checkout we have to have them singUp...and have valid addresses...
    this.props.sessionStore.authUser
      ? console.log("authorized")
      : this.props.history.push("/signin");

    this.props.itemStore.itemList.forEach((list: any) => {
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
    });

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
  }

  render() {
    return (
      <>
        <div className="contain-div">
          <div>
            <NavResult />
          </div>
          <div className="row srwedit">
            <div className="col-md-8 mb-8 text class">
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
            </div>
            <div className="col-md-4 mb-4 text class">
              This is for the Price stuff
              <div>Total: R {this.state.itemsTot}</div>
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
const condition = (authUser: any) => !!authUser;
export default compose(
  inject("sessionStore"),
  withFirebase,
  withAuthentication,
  withAuthorization(condition),
  inject("itemStore"),
  observer
)(MyCart);
