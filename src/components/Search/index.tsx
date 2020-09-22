import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";
import NavResult from "../Navbar";
import "./search.css";
import { css } from "@emotion/core";
import PacmanLoader from "react-spinners/PacmanLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import FadeIn from "react-fade-in";
import { ToastContainer, toast } from "react-toastify";

class Search extends Component<any, any> {
  override = css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
  `;
  showArryList: any[] = [];
  element: any;
  constructor(props: any) {
    super(props);
    this.state = {
      searchInput: "",
      filterPrice: "",
      allItems: [],
      filtItems: [],
      showSpinner: true,
      items: [],
      hasMore: true,
      itemCounter: 0,
      loaded: [],
      itemIds: [],
    };
    this.element = React.createRef();
    this.handleScroll = this.handleScroll.bind(this);
    this.fetchMoreData = this.fetchMoreData.bind(this);
    this.showImage = this.showImage.bind(this);
    this.onBtnClick = this.onBtnClick.bind(this);
    this.processSearch = this.processSearch.bind(this);
  }

  handleScroll(event: any) {
    if (
      event.target.scrollingElement.scrollHeight -
        event.target.scrollingElement.scrollTop ===
      event.target.scrollingElement.clientHeight
    ) {
      console.log("bottom of screen reached more required....");
      this.fetchMoreData();
    }
  }

  onChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleClick(event: any, index: any) {
    console.log("event click on card");
    this.props.history.push("/itemview", {
      fromNotifications: event,
      selectedID: this.state.itemIds[index],
    });
  }

  fetchMoreData = () => {
    let tempArr: any[] = [...this.state.filtItems];
    var tempz: any[] = [];
    var temps: any[] = [];
    this.state.filtItems.length - this.state.itemCounter > 48
      ? this.setState({ itemCounter: this.state.itemCounter + 48 })
      : this.setState({
          itemCounter: this.state.filtItems.length - this.state.itemCounter,
        });

    temps = tempArr.splice(this.state.items.length, this.state.itemCounter);

    this.setState({
      items: tempz.concat(temps),
    });
  };

  onBtnClick() {
    if (!this.state.searchInput) {
      toast.error("No Search term entered!");
    } else {
      this.processSearch({ fromNotifications: this.state.searchInput });
    }
  }

  async componentDidMount() {
    this.processSearch(this.props.location.state);

    window.addEventListener("scroll", this.handleScroll);
  }

  async processSearch(searchItem: any) {
    let allDataList: any[] = [];
    let filteredList: any[] = [];
    const { fromNotifications } = searchItem;

    try {
      await this.props.firebase
        .readAllItems()
        .then((allItems: any) => {
          //store the entire dataset locally in the event that it requires to be used
          //again...therefore saving on DB reads...
          allItems.forEach((data: any) => {
            allDataList.push(data.data());
            this.state.itemIds.push(data.id);
          });
          this.setState({ allItems: allDataList });
          filteredList = allDataList.filter((filt: any) => {
            return (
              filt.Title.toLowerCase().includes(
                fromNotifications.toLowerCase()
              ) ||
              filt.Desc.toLowerCase().includes(fromNotifications.toLowerCase())
            );
          });
          this.setState({ filtItems: filteredList });
        })
        .then(() => {
          this.setState({ showSpinner: false });
          this.fetchMoreData();
        });
    } catch (exception) {
      alert("Unable to read search items from database");
    }
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  showImage = (event: any) => {
    this.showArryList[event] = true;

    this.setState({ loaded: this.showArryList });
  };

  render() {
    return (
      <>
        <div className="contain-div">
          <div>
            <NavResult />
          </div>
          <div className="component-z">
            <div className="container ">
              <div className="row no-gutters">
                <div className="col-sm-10 col-edits">
                  <input
                    name="searchInput"
                    className="input-edit textarea"
                    type="text"
                    id="searchInput"
                    onChange={this.onChange}
                    value={this.state.searchInput || ""}
                    placeholder="Enter Search Item here"
                  ></input>
                </div>
                <div className="col-sm-2">
                  <button className="btn btn-info" onClick={this.onBtnClick}>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h1 className="header3 spacers">Search Results</h1>
            <ColoredLine />
          </div>
          <div>
            <PacmanLoader
              size={35}
              color={"#000000"}
              loading={this.state.showSpinner}
              css={this.override}
            />
          </div>
          <div>
            {this.state.showSpinner === false ? (
              <>
                {this.state.items.length > 0 ? (
                  <>
                    <div className="row srwedit">
                      <div className="col-sm-5">
                        Found: {this.state.filtItems.length} Items.
                      </div>
                      <div className="col-sm-7 col-editing">
                        <div className="dropdown">
                          <button
                            type="button"
                            className="dropdown-toggle dropdwn-edit unstyled-button"
                            data-toggle="dropdown"
                            id="dropdownMenu2"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            Filter
                          </button>
                          <div
                            className="dropdown-menu"
                            aria-labelledby="dropdownMenu2"
                          >
                            <button className="dropdown-item" type="button">
                              <FontAwesomeIcon icon={faDollarSign} />
                              Price: Low to High
                            </button>
                            <button className="dropdown-item" type="button">
                              <FontAwesomeIcon icon={faDollarSign} />
                              Price: High to Low
                            </button>
                            <button className="dropdown-item" type="button">
                              <FontAwesomeIcon icon={faStar} />
                              Premium Listings
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div ref={this.element}>
                      <div className="row row-edit">
                        {this.state.items.map((data: any, index: any) => {
                          return (
                            <div key={index}>
                              <FadeIn>
                                <div
                                  key={index}
                                  className="col-sm-4 column-edit"
                                >
                                  <div
                                    key={index}
                                    className="card container-card"
                                    onClick={() =>
                                      this.handleClick(data, index)
                                    }
                                  >
                                    <img
                                      src={data.ImgLink0}
                                      className="figure-img img-fluid rounded"
                                      alt="A "
                                      onLoad={() => this.showImage(index)}
                                    ></img>

                                    {this.state.loaded[index] ? (
                                      <div>
                                        <div className="card-body">
                                          <h5 className="card-title">
                                            {data.Title}
                                          </h5>
                                          <h5 className="card-title">
                                            R {data.Price}/day
                                          </h5>
                                        </div>
                                        <div className="middle">
                                          <div className="text">View</div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div></div>
                                    )}
                                  </div>
                                </div>
                              </FadeIn>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="header3 central">
                      No Items Matching that Description ...
                    </div>
                  </>
                )}
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        ></ToastContainer>
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

export { ColoredLine };
export default compose(
  inject("sessionStore"),
  inject("itemStore"),
  observer,
  withRouter,
  withFirebase
)(Search);
