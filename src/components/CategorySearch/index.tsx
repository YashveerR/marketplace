import React from "react";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";
import NavResult from "../Navbar";
import { css } from "@emotion/core";
import PacmanLoader from "react-spinners/PacmanLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import FadeIn from "react-fade-in";

class CategorySearch extends React.Component<
  { firebase: any; location: any; history: any },
  any
> {
  override = css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
  `;
  showArryList: any[] = [];
  constructor(props: any) {
    super(props);
    this.state = {
      items: [],
      actuals: [],
      showSpinner: true,
      itemCounter: 0,
      serachInput: "",
      itemIds: [],
      loaded: [],
    };

    this.fetchMoreData = this.fetchMoreData.bind(this);
  }

  fetchMoreData = () => {
    let tempArr: any[] = [...this.state.items];
    var tempz: any[] = [];
    var temps: any[] = [];

    this.state.items.length - this.state.itemCounter > 48
      ? this.setState({ itemCounter: this.state.itemCounter + 48 })
      : this.setState({
          itemCounter: this.state.items.length - this.state.itemCounter,
        });

    console.log(this.state.items.length, this.state.itemCounter, tempArr);
    temps = tempArr.splice(this.state.actuals.length, this.state.itemCounter);
    console.log(temps);
    this.setState({
      actuals: tempz.concat(temps),
    });
  };

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

  componentDidMount() {
    let temp: any[] = [];
    let id: any[] = [];

    try {
      this.props.firebase
        .readCats(this.props.location.state.searchCat)
        .then((data: any) => {
          //populate our items array state and display. ......

          data.forEach((item: any) => {
            id.push(item.id);
            temp.push(item.data());
            this.setState({ itemIds: id });
          });
          this.setState({ items: temp });
        })
        .then(() => {
          this.setState({ showSpinner: false });
          this.fetchMoreData();
        });
    } catch (exception) {
      alert("Error in fetching data, did teh Gremlins Hijack the information?");
    }
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
                    type="search"
                    id="searchInput"
                    onChange={this.onChange}
                    value={this.state.searchInput || ""}
                    placeholder="Enter Search Item here"
                  ></input>
                </div>
                <div className="col-sm-2">
                  <Link
                    className="btn btn-info"
                    to={{
                      pathname: "/search",
                      state: {
                        fromNotifications: this.state.searchInput,
                      },
                    }}
                  >
                    Search
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h1 className="header3 spacers">
              Category {this.props.location.state.searchCat}{" "}
            </h1>
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
                {this.state.actuals.length > 0 ? (
                  <>
                    <div className="row srwedit">
                      <div className="col-sm-5">
                        Found: {this.state.actuals.length} Items.
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
                    <div>
                      <div className="row row-edit">
                        {this.state.actuals.map((data: any, index: any) => {
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
                  <div className="header3 central">
                    {" "}
                    No Items Matching that Description ...
                  </div>
                )}
              </>
            ) : (
              <></>
            )}
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

export default compose(
  withFirebase,
  inject("sessionStore"),
  observer
)(CategorySearch);
