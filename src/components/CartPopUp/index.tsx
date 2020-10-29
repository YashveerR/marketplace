import React from "react";
import { ColoredLine } from "../Search";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { withFirebase } from "../Firebase";
import { compose } from "recompose";
import "./cartpopup.css";
//const CartStatus = ({ itemStore }: any) => <></>;
class CartSideBar extends React.Component<
  {
    closePopUp: any;
    show: boolean;
    firebase: any;
    itemStore: any;
    sessionStore: any;
    history: any;
  },
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      showSideBar: false,
    };
    this.handleDelete = this.handleDelete.bind(this);
    this.handleDates = this.handleDates.bind(this);
    this.doSum = this.doSum.bind(this);
    this.dateString = this.dateString.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleDates(date: any, date2: any) {
    let temp = new Date(date);
    let temp2 = new Date(date2);

    return Math.abs(temp2.valueOf() - temp.valueOf()) / 86400000 + 1;
  }

  doSum() {
    var tempTotal = 0;
    this.props.itemStore.itemList.forEach((data: any) => {
      console.log(new Date(data[2]), data[1]);
      tempTotal += parseInt(data[0].Price) * this.handleDates(data[2], data[1]);
    });
    console.log(tempTotal);
    this.setState({ itemsTot: tempTotal });
    return;
  }

  dateString(dateStr: any) {
    return new Date(dateStr).toDateString();
  }

  handleDelete(event: any) {
    this.props.itemStore.removeItem(event);
    this.doSum();
  }
  componentDidMount() {
    this.doSum();
  }

  handleClick() {
    this.props.history.push("/mycart");
  }

  render() {
    return (
      <>
        <div
          className="modal fade  preview-modal"
          id="cartModal"
          tabIndex={-1}
          role="dialog"
          aria-labelledby="exampleModalLongTitle"
          aria-hidden="true"
          data-backdrop=""
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLongTitle">
                  Quick View:Cart
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  {" "}
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {this.props.itemStore.itemList.length > 0 ? (
                  <div>
                    {this.props.itemStore.itemList.map(
                      (data: any, index: number) => {
                        return (
                          <div className="row" key={uuidv4()}>
                            <div key={index} className="col-sm">
                              <img
                                key={uuidv4()}
                                src={data[0].ImgLink0}
                                className="figure-img img-fluid rounded img-cart"
                                alt="cart item"
                              ></img>
                            </div>
                            <div key={uuidv4()} className="col-sm">
                              {data[0].Title}
                            </div>
                            <div key={uuidv4()} className="col-sm">
                              R {data[0].Price}/day
                            </div>
                            <div key={uuidv4()} className="col-sm">
                              From {this.dateString(data[1])} to{" "}
                              {this.dateString(data[2])}
                            </div>
                            <div key={uuidv4()} className="col-sm">
                              <button
                                className="cart-btn btn-danger"
                                onClick={() => this.handleDelete(index)}
                              >
                                <FontAwesomeIcon icon={faTrashAlt} />
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )}
                    <div>
                      <ColoredLine />
                      Total {this.state.itemsTot}
                    </div>
                  </div>
                ) : (
                  <div>
                    {" "}
                    Looks Like you do not have items in your cart, go ahead and
                    add some
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => this.handleClick()}
                  className="btn btn-secondary btn-lg active"
                >
                  Order and Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default compose(
  withRouter,
  withFirebase,
  inject("sessionStore"),
  inject("itemStore"),
  observer
)(CartSideBar);
