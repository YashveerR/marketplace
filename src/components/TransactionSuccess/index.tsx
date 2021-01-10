import React, { Component } from "react";
import { compose } from "recompose";
import { inject, observer } from "mobx-react";
import NavResult from "../Navbar";
import { withFirebase } from "../Firebase";

import "./paysuccess.css";
const ORDERED = "ordered";

class TransactionSuccess extends Component<
  { firebase: any; itemStore: any; sessionStore: any },
  any
> {
  db: any;
  unsubscribe: any;

  constructor(props: any) {
    super(props);
    this.state = {
      removalList: "",
      classSuccess: "circle-loader",
      classTick: "none",
      syncCall: false,
    };

    this.db = this.props.firebase.db;
  }

  componentDidMount() {
    //TODO: complete add item in users queue
    //TODO: execute a firestore function to send an email confirmation of order etc. etc. etc.
    try {
      this.props.firebase.auth.onAuthStateChanged(async (user: any) => {
        if (user) {
          if (window.localStorage.getItem("paymentId") != null) {
            const itemLocks = JSON.parse(
              window.localStorage.getItem("lockIds") || "{}"
            );
            if (itemLocks.lockedItems.length > 0) {
              console.log("LockIds that we are deleting from DB", itemLocks);
              itemLocks.lockedItems.forEach((data: any, index: number) => {
                try {
                  console.log(data[index], data[index + 1]);
                  this.props.firebase.deleteDateLocks(
                    data[index],
                    data[index + 1]
                  );
                } catch (exception) {
                  alert("Hmmmm... couldn't delete temporary reservation");
                }
              });
            } else {
              console.log(
                "itemlocks length not greater than 0",
                itemLocks.lockedItems.length
              );
            }
            console.log("itemLocks read", itemLocks);
            this.unsubscribe = this.db
              .collection("orders")
              .doc(user.uid)
              .collection("myOrders")
              .doc(window.localStorage.getItem("paymentId" || ""))
              .onSnapshot((querySnapshot: any) => {
                console.log("data has changed here meow", querySnapshot.data());
                if (querySnapshot.data().paymentStat === "complete") {
                  this.setState({ allowed: true });
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
                  this.setState({ justOrdered: true });
                  this.setState({
                    classSuccess: "circle-loader load-complete",
                  });
                  this.setState({ classTick: "block" });

                  this.removeLocalStorage();
                  this.props.itemStore.empty();
                  this.setState({ itemsTot: 0 });
                } else {
                  this.setState({ syncCall: false });
                }
              });
          }
        }
      });
    } catch (exception) {
      console.log("Error in creating order");
    }

    //
  }

  componentWillUnmount() {
    this.unsubscribe();
  }
  removeLocalStorage() {
    window.localStorage.removeItem("lockIds");
    window.localStorage.removeItem("paymentId");
  }
  render() {
    return (
      <>
        <div className="contain-div">
          {this.state.allowed ? (
            <>
              <div>
                <NavResult />
              </div>
              <div>
                <h3>Order Complete</h3>
                <div className={this.state.classSuccess}>
                  <div
                    className="checkmark draw"
                    style={{ display: this.state.classTick }}
                  ></div>
                </div>
                <h3>Order Added to Account!</h3>
              </div>{" "}
            </>
          ) : (
            <></>
          )}
        </div>
      </>
    );
  }
}

export default compose(
  inject("sessionStore"),
  withFirebase,
  //withAuthentication,
  //withAuthorization(condition),
  inject("itemStore"),
  observer
)(TransactionSuccess);
