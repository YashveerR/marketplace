import React, { Component } from "react";
import { compose } from "recompose";
import { inject, observer } from "mobx-react";
import NavResult from "../Navbar";
import { withFirebase } from "../Firebase";
import { Redirect } from "react-router-dom";
import "./paysuccess.css";
const ORDERED = "ordered";

class TransactionSuccess extends Component<
  { firebase: any; itemStore: any; sessionStore: any },
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      removalList: "",
      classSuccess: "circle-loader",
      classTick: "none",
      syncCall: false,
    };
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
            console.log("itemLocks read", itemLocks);
            await this.props.firebase
              .readPaymentStat(
                user.uid,
                window.localStorage.getItem("paymentId" || "")
              )
              .then((doc: any) => {
                if (doc.data().paymentStat === "complete") {
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
                  if (itemLocks.length > 0) {
                    console.log(
                      "LockIds that we are deleting from DB",
                      itemLocks
                    );
                    itemLocks.lockedItems.forEach(
                      (data: any, index: number) => {
                        try {
                          console.log(data[index], data[index + 1]);
                          this.props.firebase.deleteDateLocks(
                            data[index],
                            data[index + 1]
                          );
                        } catch (exception) {
                          alert(
                            "Hmmmm... couldn't delete temporary reservation"
                          );
                        }
                      }
                    );
                  } else {
                    console.log(
                      "itemlocks length not greater than 0",
                      itemLocks.length
                    );
                  }
                  this.removeLocalStorage();
                  this.props.itemStore.empty();
                  this.setState({ itemsTot: 0 });
                } else {
                  this.setState({ syncCall: true });
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

  removeLocalStorage() {
    window.localStorage.removeItem("lockIds");
    window.localStorage.removeItem("paymentId");
  }
  render() {
    return (
      <>
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
          <>{this.state.syncCall ? <Redirect to="/" /> : null}</>
        )}
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
