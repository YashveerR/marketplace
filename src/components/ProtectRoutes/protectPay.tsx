import React, { Component } from "react";
import { Route, Redirect } from "react-router-dom";
import { withFirebase } from "../Firebase";
import { compose } from "recompose";
import * as ROUTES from "../../constants/routes";
import TransactionSuccess from "../../components/TransactionSuccess";

class ProtectPayPage extends Component<{ firebase: any }, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      allowed: false,
    };
  }

  componentDidMount() {
    try {
    } catch {
      console.log("some error happened meow.... ");
    }
  }

  render() {
    return (
      <>
        {this.state.allowed ? (
          <Route
            path={ROUTES.PAYMENT_PASS}
            component={TransactionSuccess}
          ></Route>
        ) : (
          <Redirect to="/" />
        )}
      </>
    );
  }
}
export default compose(withFirebase)(ProtectPayPage);
