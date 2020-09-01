import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import NavResult from "../Navbar";
import DatePicker from "react-datepicker";
import "./displayitem.css";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";

class DisplayItem extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      dates: "",
      itemTitle: "",
      itemDesc: "",
      itemPrice: "",
      itemCreator: "",
      itemCategory: "",
      fileOne: "",
      fileTwo: "",
      fileThree: "",
      publicItem: false,
      data: [],
      startDate: new Date(),
      endDate: new Date(),
      tempSDate: new Date(),
      tempEDate: null,
      allItemDates: [],
    };
    this.addToCart = this.addToCart.bind(this);
  }

  //because we are parsing the data as a prop in here no need to load it from teh server,
  //just store in the states and load the information on the page.. with date picker....

  componentDidMount() {
    console.log(
      "Props from other page",
      this.props.location.state.fromNotifications
    );
    this.setState({ data: this.props.location.state.fromNotifications });

    this.props.firebase
      .readItemDates(this.props.location.state.selectedID)
      .then();
  }

  handleChange = (date: any) => {
    this.setState({
      startDate: date,
    });
  };

  handleChangeEnd = (date: any) => {
    this.setState({
      endDate: date,
    });
  };

  addToCart() {
    console.log(
      "updating cart and return value",
      this.props.itemStore.addItems(
        this.state.data,
        new Date(
          this.state.startDate.getFullYear(),
          this.state.startDate.getMonth(),
          this.state.startDate.getDate()
        ),
        new Date(
          this.state.endDate.getFullYear(),
          this.state.endDate.getMonth(),
          this.state.endDate.getDate()
        ),
        this.props.location.state.selectedID
      )
    );

    //this.props.itemStore.empty();
  }

  componentDidUpdate(props: any) {
    console.log("something has updated ....");
  }

  render() {
    console.log("render list", this.props.itemStore.itemList);
    return (
      <>
        <div className="contain-div">
          <div>
            <NavResult />
          </div>
          <div className="spacers">
            Have the history categories here (clickable) / laurem ipsum etc /
          </div>
          <div className="spacers">
            <ColoredLine />
          </div>
          <div className="row srwedit">
            <div className="col-md-5 mb-5 text-class">
              <div className="image scroller with click">
                <Carousels
                  picList={[
                    this.state.data.ImgLink0,
                    this.state.data.ImgLink1,
                    this.state.data.ImgLink2,
                  ]}
                />
              </div>
            </div>
            <div className="col-md-7 mb-5 text-class">
              <div className="itemTitle">{this.state.data.Title}</div>
              <div className="itemPrice">
                Price per day: R{this.state.data.Price}
              </div>
              <div className="itemDesc">
                Item Description: {this.state.data.Desc}
              </div>
              <div className="itemDesc"> Select Available Dates</div>
              <div className="row srwedit">
                <div className="col-md-3 mb-3 text-class">
                  <div className="text-class"> Start Date</div>
                  <DatePicker
                    selected={this.state.startDate}
                    onChange={(sDate) => this.handleChange(sDate)}
                    popperPlacement="bottom"
                    popperModifiers={{
                      flip: {
                        behavior: ["bottom"], // don't allow it to flip to be above
                      },
                      preventOverflow: {
                        enabled: false, // tell it not to try to stay within the view (this prevents the popper from covering the element you clicked)
                      },
                      hide: {
                        enabled: false, // turn off since needs preventOverflow to be enabled
                      },
                    }}
                  />
                </div>
                <div className="col-md-3 mb-3 text-class">
                  <div className="text-class"> End Date</div>
                  <DatePicker
                    selected={this.state.endDate}
                    onChange={this.handleChangeEnd}
                    popperPlacement="bottom"
                    popperModifiers={{
                      flip: {
                        behavior: ["bottom"], // don't allow it to flip to be above
                      },
                      preventOverflow: {
                        enabled: false, // tell it not to try to stay within the view (this prevents the popper from covering the element you clicked)
                      },
                      hide: {
                        enabled: false, // turn off since needs preventOverflow to be enabled
                      },
                    }}
                  />
                </div>
              </div>
              <div className="itemDesc">
                {" "}
                <button onClick={this.addToCart}>
                  <FontAwesomeIcon icon={faCartPlus} /> Add to Cart
                </button>
              </div>
              <div className="itemDesc"> Delivery Terms </div>
              <div className="terms"> Delivery Terms </div>
              <div className="itemDesc"> Rental Policy and Terms</div>
              <div className="terms"> Rental Policy and Terms</div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

const ColoredLine = ({ color }: any) => (
  <hr
    style={{
      color: color,
      backgroundColor: color,
      height: 5,
      marginTop: 0,
    }}
  />
);

//create a component that can take
const Carousels = ({ picList }: any) => (
  <>
    <div
      id="carouselExampleControls"
      className="carousel slide"
      data-ride="carousel"
    >
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img
            className="d-block w-100"
            src={picList[0]}
            alt="First slide"
          ></img>
        </div>
        <div className="carousel-item">
          <img
            className="d-block w-100"
            src={picList[1]}
            alt="Second slide"
          ></img>
        </div>
        <div className="carousel-item">
          <img
            className="d-block w-100"
            src={picList[2]}
            alt="Third slide"
          ></img>
        </div>
      </div>
      <a
        className="carousel-control-prev"
        href="#itemimages"
        role="button"
        data-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="sr-only">Previous</span>
      </a>
      <a
        className="carousel-control-next"
        href="#carouselExampleControls"
        role="button"
        data-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="sr-only">Next</span>
      </a>
    </div>
  </>
);

export default compose(
  withRouter,
  inject("itemStore"),

  observer
)(DisplayItem);
