import React, { Component } from "react";
import { compose } from "recompose";
import { inject, observer } from "mobx-react";
import NavResult from "../Navbar";

class MyCart extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      cartItems: [],
    };
  }

  componentDidMount() {
    console.log(this.props.itemStore.itemList);
  }

  render() {
    return (
      <>
        <div className="contain-div">
          <div>
            <NavResult />
          </div>
          <div className="row srwedit">
            <div className="col-md-10 mb-8 text class">
              {this.props.itemStore.itemList.map((data: any, index: number) => {
                return (
                  <div className="row srwedit">
                    <div key={index} className="col-md-5 mb-5 text-class">
                      {data[0].Title}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="col-md-2 mb-2 text class">
              This is for the Price stuff
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default compose(inject("itemStore"), observer)(MyCart);
