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
import { withFirebase } from "../Firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class DisplayItem extends Component<
  { firebase: any; location: any; itemStore: any },
  any
> {
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
      startDate: "",
      endDate: "",
      tempSDate: new Date(),
      tempEDate: null,
      allItemDates: [],
      exclusionDates: [],
      enableBtn: true,
    };
    this.addToCart = this.addToCart.bind(this);
  }

  //because we are parsing the data as a prop in here no need to load it from teh server,
  //just store in the states and load the information on the page.. with date picker....

  componentDidMount() {
    let tempDates: Date[] = [];
    console.log(
      "Ther ID from the Search is: ",
      this.props.location.state.selectedID
    );
    this.setState({ data: this.props.location.state.fromNotifications });
    try {
      this.props.firebase
        .readItemDates(this.props.location.state.selectedID)
        .then((data: any) => {
          data.forEach((items: any) => {
            tempDates.push(items.data()["startDate"].toDate());
            tempDates.push(items.data()["endDate"].toDate());
            this.setState({ exclusionDates: tempDates });
            console.log("exclusion dates ", items.data()["startDate"].toDate());
          });
        });
    } catch (exception) {
      alert("Error fetching from database");
    }
  }

  handleChange = (date: any) => {
    this.setState({
      startDate: date,
    });
  };

  handleChangeEnd = (date: any) => {
    if (this.state.startDate !== "") {
      this.setState({
        endDate: date,
        enableBtn: false,
      });
    } else {
      toast.error("Please select a start date first!");
      this.setState({
        enableBtn: true,
        startDate: "",
        endDate: "",
      });
    }
  };

  priceEstimate() {
    if (this.state.startDate !== "" && this.state.endDate !== "") {
      return (
        parseInt(this.state.data.Price) *
        (Math.abs(
          new Date(this.state.endDate).valueOf() -
            new Date(this.state.startDate).valueOf()
        ) /
          86400000 +
          1)
      );
    } else {
      return 0;
    }
  }

  addToCart() {
    //Do a quick check for cart dates correctness.. error checking...
    console.log("adding item to cart", this.state.data);
    if (this.state.startDate.getTime() <= this.state.endDate.getTime()) {
      this.props.itemStore.addItems(
        this.state.data,
        new Date(
          this.state.startDate.getFullYear(),
          this.state.startDate.getMonth(),
          this.state.startDate.getDate(),
          0
        ),
        new Date(
          this.state.endDate.getFullYear(),
          this.state.endDate.getMonth(),
          this.state.endDate.getDate(),
          0
        ),
        this.props.location.state.selectedID
      );

      this.setState({
        enableBtn: true,
        startDate: "",
        endDate: "",
      });
      if (this.props.itemStore.listError === "duplicate item") {
        toast.error("🕷 Error detected in basket");
      } else {
        toast.warn("Successfully added item to basket ");
      }
    } else {
      toast.error("Date selection error, try again!");
    }
    /*   
    
      
    
*/
  }

  render() {
    return (
      <>
        <div className="contain-div">
          <div>
            <NavResult />
          </div>
          <div className="spacers">
            {this.state.data.Cat} / {this.state.data.Title} /
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
                    placeholderText="Click to select a date"
                    selected={this.state.startDate}
                    onChange={(sDate) => this.handleChange(sDate)}
                    popperPlacement="bottom"
                    excludeDates={this.state.exclusionDates}
                    minDate={new Date()}
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
                    placeholderText="Click to select a date"
                    selected={this.state.endDate}
                    onChange={this.handleChangeEnd}
                    minDate={new Date()}
                    popperPlacement="bottom"
                    excludeDates={this.state.exclusionDates}
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
                  <div className="text-class">
                    {" "}
                    Price Estimate : {this.priceEstimate()}{" "}
                  </div>
                </div>
              </div>
              <div className="itemDesc">
                {" "}
                <button
                  onClick={this.addToCart}
                  disabled={this.state.enableBtn}
                >
                  <FontAwesomeIcon icon={faCartPlus} /> Add to Cart
                </button>
              </div>
              <div className="itemDesc"> Delivery Terms </div>
              <div className="terms"> Delivery Terms </div>
              <div className="itemDesc"> Rental Policy and Terms</div>
              <div className="terms"> Rental Policy and Terms</div>
            </div>
          </div>

          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          ></ToastContainer>
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
  withFirebase,
  inject("itemStore"),

  observer
)(DisplayItem);
