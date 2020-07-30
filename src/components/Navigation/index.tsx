import React from "react";
import { Link } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import SignOutButton from "../SignOut";
import * as ROUTES from "../../constants/routes";

const Navigation = ({ sessionStore }: any) =>
  sessionStore.authUser ? <NavigationAuth /> : <NavigationNonAuth />;

const NavigationAuth = ({ authUser }: any) => (
  <div>
    <nav>
      <ul>
        <li>
          <Link to={ROUTES.ACCOUNT}>Account</Link>
        </li>
        <li>
          <SignOutButton />
        </li>
      </ul>
    </nav>
  </div>
);

const NavigationNonAuth = () => (
  <nav>
    <ul>
      <li>
        <Link to={ROUTES.SIGN_IN}>Sign Inz</Link>
      </li>
    </ul>
  </nav>
);

export default compose(inject("sessionStore"), observer)(Navigation);
