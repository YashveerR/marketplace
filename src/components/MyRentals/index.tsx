import React from "react";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";
import { v4 as uuidv4 } from "uuid";
import "./myrentals.css";
import { ToastContainer, toast } from "react-toastify";

class MyRentals extends React.Component<{ firebase: any }, any> {
  //TODO: going to need to ONLY allow a forward movement 1 place at a time!
  //BUGS AND FRINGE IDIOTS who want to skip forward in times...
  itemOrder = [
    "ordered",
    "pending delivery",
    "delivered",
    "in use",
    "pending return",
    "returned",
  ];

  constructor(props: any) {
    super(props);
    this.state = {
      userId: "",
      ordersList: [],
      orderStatSel: [],
      sliceIdx_0: [],
      sliceIdx_1: [],
    };
    this.dateString = this.dateString.bind(this);
    this.orderChange = this.orderChange.bind(this);
    this.updateOrder = this.updateOrder.bind(this);
  }

  updateOrder(index: number) {
    var temoIdx = [...this.state.sliceIdx_0];
    const docId = this.state.ordersList[index][1].renter;
    const orderNo = this.state.ordersList[index][1].orderNo;

    temoIdx[index] = this.itemOrder.findIndex(
      (element: any) => element === this.state.orderStatSel[index]
    );
    this.setState({ sliceIdx_0: temoIdx });
    try {
      this.props.firebase
        .updateOrder(
          this.props.firebase.auth.currentUser["uid"],
          this.state.ordersList[index][0],
          this.state.orderStatSel[index]
        )
        .then(() => {
          toast.success("Successfully updated Order");
        })
        .catch(() => {
          toast.error("Update failed!");
        });
    } catch (except) {
      toast.error("Hellfire has rained down ...Error!");
    }

    //call cloud function to send out notification emails to creator and recipient

    //we need to receive the person ordering the stuff and their details to populate teh cloud
    //function OR we let the cloud function do that... either way...

    /* var sendNotifications = this.props.firebase.functions.httpsCallable(
      "sendOrderStatus"
    );
    sendNotifications({
      text: JSON.stringify({
        recipientOrderNo: orderNo,
        recipientId: docId,
        orderS: this.state.orderStatSel[index],
      }),
      context: "Nothing to see here",
    }).then(() => {
      //there is no return value for meow....
    }); */

    this.props.firebase.updateUserOrder(
      docId,
      orderNo,
      this.state.orderStatSel[index]
    );
    console.log(
      JSON.stringify({ recipientOrderNo: orderNo, recipientId: docId })
    );
  }

  orderChange = (event: any) => {
    var temp = [...this.state.orderStatSel];

    const index = parseInt(event.target.name);

    temp[index] = event.target.value;

    console.log(temp, event);
    this.setState({ orderStatSel: temp });
    console.log(this.state.orderStatSel);
  };

  dateString(dateStr: any) {
    return new Date(dateStr).toDateString();
  }

  mapOrder(array: any, order: any, key: any) {
    array.sort(function (a: any, b: any) {
      var A = a[1][key],
        B = b[1][key];

      if (order.indexOf(A) > order.indexOf(B)) {
        return 1;
      } else {
        return -1;
      }
    });

    return array;
  }
  componentDidMount() {
    var list: any[] = [];
    var oStats: any[] = [];
    var findItem: any[] = [];

    try {
      this.props.firebase.auth.onAuthStateChanged((user: any) => {
        if (user) {
          this.props.firebase
            .readOwnerOrders(this.props.firebase.auth.currentUser["uid"])
            .then((doc: any) => {
              doc.forEach((item: any) => {
                list.push([item.id, item.data()]);
              });
            })
            .then(() => {
              this.setState({
                ordersList: this.mapOrder(list, this.itemOrder, "orderStat"),
              });
              this.state.ordersList.forEach((element: any, index: any) => {
                oStats.push(element[1].orderStat);
                this.setState({ orderStatSel: oStats });
                findItem[index] = this.itemOrder.findIndex(
                  (element: any) => element === this.state.orderStatSel[index]
                );
                this.setState({ sliceIdx_0: findItem });
              });
            });
        }
      });
    } catch (exception) {
      alert("Error in retrieving my rentals");
      console.log(exception);
    }
  }

  render() {
    return (
      <>
        <div>
          {this.state.ordersList.map((data: any, index: number) => {
            return (
              <div className="card column-edit" key={uuidv4()}>
                <div className="row srwedit" key={uuidv4()}>
                  <div key={uuidv4()} className="col-md-1 mb-2 txt-rentals">
                    {this.dateString(data[1].start)}
                  </div>
                  <div key={uuidv4()} className="col-md-1 mb-2 txt-rentals">
                    {this.dateString(data[1].end)}
                  </div>
                  <div key={uuidv4()} className="col-md-2 mb-2 txt-rentals">
                    {data[1].itemTitle}
                  </div>
                  <div key={uuidv4()} className="col-md-2 mb-2 txt-rentals">
                    {data[1].orderNo}
                  </div>
                  <div key={uuidv4()} className="col-md-1 mb-1 txt-rentals">
                    {this.state.orderStatSel.length > 0 ? (
                      <select
                        name={index.toString()}
                        value={this.state.orderStatSel[index]}
                        onChange={this.orderChange}
                        key={uuidv4()}
                      >
                        {this.itemOrder
                          .slice(
                            this.state.sliceIdx_0[index],
                            this.state.sliceIdx_0[index] ===
                              this.itemOrder.length
                              ? this.state.sliceIdx_0[index]
                              : this.state.sliceIdx_0[index] + 2
                          )
                          .map((items: any, i: number) => {
                            return <option key={uuidv4()}>{items}</option>;
                          })}
                      </select>
                    ) : (
                      ""
                    )}
                  </div>
                  <div key={uuidv4()} className="col-md-2 mb-2">
                    <button
                      onClick={() => this.updateOrder(index)}
                      className="btn btn-secondary btn-rentals"
                    >
                      Update order status
                    </button>
                  </div>
                  <div key={uuidv4()} className="col-md-2 mb-2">
                    <button className="btn btn-secondary btn-rentals">
                      Contact renter
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
      </>
    );
  }
}

export default compose(
  withFirebase,
  inject("sessionStore"),
  observer
)(MyRentals);
