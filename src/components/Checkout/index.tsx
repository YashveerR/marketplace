import React from "react";
import { compose } from "recompose";
import { inject, observer } from "mobx-react";
import { withFirebase } from "../Firebase";

class Checkout extends React.Component<{ firebase: any }, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      userId: "",
    };
  }

  render() {
    return <></>;
  }
}

export default compose(
  withFirebase,
  inject("sessionStore"),
  observer
)(Checkout);
