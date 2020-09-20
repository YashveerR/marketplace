import React from "react";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";

class MyRentals extends React.Component<{ firebase: any }> {
  constructor(props: any) {
    super(props);
    this.state = { userId: "" };
  }

  componentDidMount() {
    var list: any[] = [];

    try {
      this.props.firebase.auth.onAuthStateChanged((user: any) => {
        if (user) {
          this.props.firebase
            .readOwnerOrders(this.props.firebase.auth.currentUser["uid"])
            .then((doc: any) => {
              list.push(doc);
            })
            .then(() => {
              console.log("all the user items", list);
            });
        }
      });
    } catch (exception) {
      alert("Error in retrieving my rentals");
    }
  }

  render() {
    return <></>;
  }
}

export default compose(inject("sessionStore"), observer)(MyRentals);
