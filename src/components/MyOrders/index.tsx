import React from "react";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import "./myorders.css";
import { withFirebase } from "../Firebase";

class MyOrders extends React.Component<{ firebase: any }, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      items: [],
    };
  }

  componentDidMount() {
    var list: any[] = [];
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

  render() {
    return (
      <>
        <div>
          <div className="row srwedit">
            {this.state.items.map((data: any, index: number) => {
              return (
                <div key={index} className="col-md-2 mb-2 text class">
                  {" "}
                  {data.end}
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
