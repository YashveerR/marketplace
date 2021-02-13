import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import "mobx-react-lite/batchingForReactDom";
import "./home.css";
import NavResult from "../Navbar";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import { STORECATS } from "../../constants/storeCats";
import { ToastContainer, toast } from "react-toastify";
import gadgets from "../../assets/gadgets.jpg";
import homeware from "../../assets/homeware.jpg";
import tools from "../../assets/tools.jpg";
import sports from "../../assets/sports.jpg";
import kids from "../../assets/kids.jpg";
import toys from "../../assets/toys.jpg";
import entertain from "../../assets/entertain.jpg";
import gaming from "../../assets/gaming.jpg";
import books from "../../assets/books.jpg";
import crafts from "../../assets/crafts.jpg";
import outdoor from "../../assets/outdoor.jpg";
import Information from "../Information";
import { withFirebase } from "../Firebase";

class Home extends Component<
  { firebase: any; history: any; sessionStore: any },
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      searchInput: "",
      showModal: false,
    };
    this.keyPressed = this.keyPressed.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.onBtnClick = this.onBtnClick.bind(this);
  }
  imgArr = [
    gadgets,
    homeware,
    tools,
    sports,
    kids,
    toys,
    entertain,
    books,
    gaming,
    crafts,
    outdoor,
  ];

  categoriesArr = [
    "Electronics",
    "Homeware",
    "Tools",
    "Sports Equipment",
    "Kids",
    "Toys",
    "Entertainment",
    "Books",
    "Gaming",
    "Crafts",
    "Outdoors",
  ];

  viewNewItemForm() {
    this.setState({
      showModal: !this.state.showModal,
    });

    toast.success("Personal Information Updated!");
  }

  onChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  keyPressed(event: any) {
    if (event.key === "Enter") {
      if (!this.state.searchInput) {
        toast.error("No Search term entered!");
      } else {
        this.props.history.push("/search", {
          fromNotifications: this.state.searchInput,
        });
      }
    }
  }
  handleClick(event: any) {
    this.props.history.push("/cats", {
      searchCat: event,
    });
  }

  onBtnClick() {
    if (!this.state.searchInput) {
      toast.error("No Search term entered!");
    } else {
      this.props.history.push("/search", {
        fromNotifications: this.state.searchInput,
      });
    }
  }

  componentDidMount() {
    //check if the account has profile information on first log in and etc... if it does not then
    //push this to the main screen whilst they add the information...
    try {
      this.props.firebase.onAuthUserListener(
        (authUser: any) => {
          //user logged in here....
          this.props.firebase
            .doReadSingleDoc(this.props.firebase.auth.currentUser["uid"])
            .then((_doc: any) => {
              console.log(_doc.data());
              if (_doc.data().address_list === undefined) {
                this.setState({ showModal: true });
              }
            });
        },
        () => {
          //no ouser logged in meow
          console.log("no user logged in meow.. do not display pop up");
        }
      );
    } catch (Exception) {
      console.log(Exception);
    }
  }

  render() {
    return (
      <>
        <div className="containerz">
          <div>
            <NavResult />
          </div>
          <div>
            <div className="header-div">
              <h1 className="header">Rent-A-Thing</h1>
              <p className="p-new"> Why buy when you can rent ...</p>
            </div>
            <div className="form-align">
              <div className="container">
                <div className="row no-gutters">
                  <div className="col-sm-10">
                    <input
                      name="searchInput"
                      className="inputs"
                      type="text"
                      id="searchInput"
                      onChange={this.onChange}
                      onKeyPress={this.keyPressed}
                      value={this.state.searchInput}
                      placeholder="Enter Search Item here"
                    ></input>
                  </div>
                  <div className="col-sm-2">
                    <button onClick={this.onBtnClick} className="btn btn-info">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="contain-div">
            <h1 className="header2 spacers">OR... Browse our categories</h1>

            <div className="row">
              {STORECATS.slice(1).map((item, i) => {
                return (
                  <div key={i} className="col-sm-3 col-unsets">
                    <div className="container-card card card-edit">
                      <img
                        className="image"
                        alt="..."
                        src={this.imgArr[i]}
                        onClick={() => this.handleClick(this.categoriesArr[i])}
                      ></img>
                      <div className="middle">
                        <div className="text">{this.categoriesArr[i]}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
        {this.state.showModal ? (
          <>
            <Information
              closePopUp={this.viewNewItemForm.bind(this)}
              show={this.state.showModal}
              firebase={this.props.firebase}
            />
          </>
        ) : null}
      </>
    );
  }
}

export default compose(
  inject("sessionStore"),
  inject("itemStore"),
  observer,
  withRouter,
  withFirebase
)(Home);
