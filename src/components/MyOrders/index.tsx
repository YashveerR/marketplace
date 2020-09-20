import React from "react";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import "./myorders.css";
import { withFirebase } from "../Firebase";
import { v4 as uuidv4 } from "uuid";

class MyOrders extends React.Component<{ firebase: any }, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      items: [],
    };
  }

  componentDidMount() {
    var list: any[] = [];
    try {
      this.props.firebase.auth.onAuthStateChanged((user: any) => {
        if (user) {
          this.props.firebase
            .readUserOrder(this.props.firebase.auth.currentUser["uid"])
            .then((data: any) => {
              data.forEach((order: any) => {
                console.log(order.data()["item"]);
                list.push(order.data());
                this.setState({ items: list });
              });
            });
        }
      });
    } catch (exception) {
      alert("Error in retrieving my orders");
    }
  }

  render() {
    return (
      <>
        <div>
          <div>
            {this.state.items.map((data: any, index: number) => {
              return (
                <div className="row srwedit" key={uuidv4()}>
                  <div
                    key={uuidv4()}
                    className="col-md-2 mb-2 small-text class"
                  >
                    {"  "}
                    {data.start}
                  </div>
                  <div
                    key={uuidv4()}
                    className="col-md-2 mb-2 small-text class"
                  >
                    {" "}
                    {data.end}
                  </div>
                  <div
                    key={uuidv4()}
                    className="col-md-2 mb-2 small-text class"
                  >
                    {" "}
                    {data.orderId}
                  </div>
                  <div
                    key={uuidv4()}
                    className="col-md-2 mb-2 small-text class"
                  >
                    {" "}
                    {data.orderStatus}
                  </div>
                  <div
                    key={uuidv4()}
                    className="col-md-2 mb-2 small-text class"
                  >
                    {" "}
                    {data.item}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }
}

export default compose(
  withFirebase,
  inject("sessionStore"),
  observer
)(MyOrders);
