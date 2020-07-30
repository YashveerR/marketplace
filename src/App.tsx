import React from "react";
import SignUpPage from "../src/components/SignUp";
import SignInPage from "../src/components/SignIn";
import PasswordForgetPage from "../src/components/PasswordForget";
import HomePage from "../src/components/Home";
import AccountPage from "../src/components/Account";
import AdminPage from "../src/components/Admin";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import * as ROUTES from "../src/constants/routes";
import { withAuthentication } from "../src/components/Session";

const App = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
      <Route path={ROUTES.SIGN_IN} component={SignInPage} />
      <Route path={ROUTES.ACCOUNT} component={AccountPage} />
      <Route path={ROUTES.ADMIN} component={AdminPage} />
    </Switch>
  </BrowserRouter>
);

export default withAuthentication(App);
