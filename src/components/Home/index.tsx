import React from "react";
import "mobx-react-lite/batchingForReactDom";
import "./home.css";
import Button from "react-bootstrap/Button";
import NavResult from "../Navbar";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";

const Home = ({ sessionStore }: any) => (
  <div className="containerz">
    <div>
      <NavResult />
    </div>
    <div>
      <div className="header-div">
        <h1 className="header">Rent-A-Thing</h1>
        <p className="p-new"> Why buy when you can rent ...</p>
      </div>
      <form className="form-align">
        <div className="container">
          <div className="row no-gutters">
            <div className="col-sm-10">
              <input
                className="inputs"
                type="text"
                id="staticEmail"
                placeholder="Enter Search Item here"
              ></input>
            </div>
            <div className="col-sm-2">
              <Button variant="info">Primary</Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
);
const Cards = () => <div></div>;

export default compose(inject("sessionStore"), observer)(Home);
export { Cards };
