import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import { withAuthorization, withEmailVerification } from "../Session";
import { withFirebase } from "../Firebase";
import "./myitems.css";
import { STORECATS } from "../../constants/storeCats";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class MyItems extends Component<any, any> {
  test_prop: any;

  constructor(props: any) {
    super(props);
    this.state = {
      viewform: false,
      toastresponse: "",
      toaststyle: false,
      myItems: [],
      itemsDL: false,
    };
  }

  viewNewItemForm() {
    this.setState({
      viewform: !this.state.viewform,
    });
  }
  toastmessage = (datafromchild: any) => {
    this.setState({ toastresponse: datafromchild });
  };

  toastresult = (datafromchild: any) => {
    this.setState({ toaststyle: datafromchild });
    this.state.toaststyle
      ? toast.success(this.state.toastresponse)
      : toast.error(this.state.toastresponse);
  };

  componentDidMount() {
    let tempArr: any[] = [];
    //retrieve user items from firebase
    this.props.firebase
      .readUserItems(this.props.firebase.auth.currentUser["uid"])
      .then((doc: any) => {
        doc.forEach((element: any) => {
          tempArr.push(element.data());
          this.setState({ myItems: tempArr });
          this.setState({ itemsDL: true });
        });
      });
  }
  //So we are going to ge the number of user items and display them as cards with their titles here
  //We will have a function that pulls the user cards on load and then populate the below using
  //array populace. Also unclude a button for adding new content.
  render() {
    return (
      <>
        <div className="row row-edit">
          {this.state.itemsDL
            ? this.state.myItems.map((data: any, index: any) => {
                return (
                  <div key={index} className="col-sm-3 column-edit">
                    <div className="card ">
                      <img
                        src={data.ImgLink0}
                        className="card-img-top"
                        alt="..."
                      ></img>
                      <div className="card-body">
                        <h5 className="card-title">{data.Title} </h5>
                        <p className="card-text"></p>
                        <a href="/" className="card-link">
                          Edit Item
                        </a>
                        <a href="/" className="card-link">
                          Delete Item
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            : ""}
        </div>
        <button
          onClick={this.viewNewItemForm.bind(this)}
          type="button"
          className="btn btn-success btn-circle"
        >
          +
        </button>

        {this.state.viewform ? (
          <PopupBox
            text="Close Me"
            closePopup={this.viewNewItemForm.bind(this)}
            toastRetval={this.toastmessage}
            toastType={this.toastresult}
          />
        ) : null}
        <div>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          {/* Same as */}
          <ToastContainer />
        </div>
      </>
    );
  }
}

class Popup extends React.Component<any, any> {
  imgArry: any = [];
  constructor(props: any) {
    super(props);
    this.state = {
      itemTitle: "",
      itemDesc: "",
      itemPrice: "",
      itemCreator: "",
      itemCategory: "",
      fileOne: "",
      fileTwo: "",
      fileThree: "",
    };

    this.imgOnChange = this.imgOnChange.bind(this);
  }

  onSubmit = async (event: any) => {
    event.preventDefault();
    let tempArr: any = [
      this.state.fileOne,
      this.state.fileTwo,
      this.state.fileThree,
    ];

    var p = Promise.all(
      tempArr.map(async (image: any) => {
        return await this.props.firebase.createImages(image);
      })
    ).then(
      (value: any) => {
        console.log(value);
        this.props.firebase
          .createUserItem(
            this.props.firebase.auth.currentUser["uid"],
            this.state.itemTitle,
            this.state.itemDesc,
            this.state.itemPrice,
            this.state.itemCategory,
            value
          )
          .then(() => {
            this.props.toastRetval("Data Successfully Uploaded");
            this.props.toastType(true);
          });
      },
      (nonValue) => {
        this.props.toastRetval(nonValue);
        this.props.toastType(false);
      }
    );

    return this.props.closePopup(true);
  };

  onChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  imgOnChange = (event: any) => {
    if (this.maxSelectFile(event) && this.checkMimeType(event)) {
      this.setState({ [event.target.name]: event.target.files[0] });
    }
  };

  maxSelectFile = (event: any) => {
    let files = event.target.files; // create file object
    if (files.length > 1) {
      const msg = "Only 1 images can be uploaded at a time";
      event.target.value = null; // discard selected file
      console.log(msg);
      return false;
    }
    return true;
  };

  checkMimeType = (event: any) => {
    //getting file object
    let files = event.target.files;
    //define message container
    let err = "";
    // list allow mime type
    const types = ["image/png", "image/jpeg", "image/gif"];
    // loop access array
    // compare file type find doesn't matach
    if (types.every((type: any) => files[0].type !== type)) {
      // create error message and assign to container
      err += files[0].type + " is not a supported format\n";
    }

    if (err !== "") {
      // if message not same old that mean has error
      event.target.value = null; // discard selected file
      console.log(err);
      return false;
    }
    return true;
  };

  checkFileSize = (event: any) => {
    let files = event.target.files;
    let size = 15000;
    let err = "";
    for (var x = 0; x < files.length; x++) {
      if (files[x].size > size) {
        err += files[x].type + "is too large, please pick a smaller file\n";
      }
    }
    if (err !== "") {
      event.target.value = null;
      console.log(err);
      return false;
    }

    return true;
  };

  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <form onSubmit={this.onSubmit}>
            <div className="form-group">
              <div className="input-group-prepend">
                <label
                  className="input-group-text"
                  htmlFor="inputGroupSelect01"
                >
                  Item Name
                </label>
                <input
                  name="itemTitle"
                  type="text"
                  className="form-control input-edit"
                  id="formGroupExampleInput"
                  placeholder="What is the name of the Item?"
                  onChange={this.onChange}
                ></input>
              </div>
            </div>
            <div className="form-group">
              <div className="input-group-prepend">
                <label
                  className="input-group-text"
                  htmlFor="inputGroupSelect01"
                >
                  Item Description
                </label>
                <input
                  name="itemDesc"
                  type="text"
                  className="form-control input-edit"
                  id="formGroupExampleInput"
                  placeholder="Describe Item here. eg. Fancy Tool box set, spanner sizes 5-25"
                  onChange={this.onChange}
                ></input>
              </div>
            </div>
            <div className="form-group">
              <div className="input-group-prepend">
                <label
                  className="input-group-text"
                  htmlFor="inputGroupSelect01"
                >
                  Rands
                </label>
                <input
                  name="itemPrice"
                  type="text"
                  className="form-control input-edit"
                  id="formGroupExampleInput"
                  placeholder="Item Price Per Day"
                  onChange={this.onChange}
                ></input>
                <div className="input-group-append">
                  <span className="input-group-text">.00</span>
                </div>
              </div>
            </div>
            <div className="form-group">
              <div className="input-group-prepend">
                <label
                  className="input-group-text"
                  htmlFor="inputGroupSelect01"
                >
                  Category
                </label>
                <select
                  name="itemCategory"
                  className="custom-select"
                  id="inputGroupSelect01"
                  onChange={this.onChange}
                >
                  {STORECATS.map((item, i) => {
                    return <option key={i}>{item} </option>;
                  })}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="exampleFormControlFile1">
                Choose at least 3 Images that shows off your Item
              </label>
              <input
                name="fileOne"
                type="file"
                className="form-control-file file"
                id="exampleFormControlFile0"
                onChange={this.imgOnChange}
              ></input>
              <input
                name="fileTwo"
                type="file"
                className="form-control-file file"
                id="exampleFormControlFile1"
                onChange={this.imgOnChange}
              ></input>
              <input
                name="fileThree"
                type="file"
                className="form-control-file file"
                id="exampleFormControlFile2"
                onChange={this.imgOnChange}
              ></input>
            </div>
            <button
              className="btn btn-secondary btn-edit btn-apart"
              type="submit"
            >
              Add
            </button>
            <button
              className="btn btn-secondary btn-edit"
              onClick={this.props.closePopup}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }
}

const PopupBox = withFirebase(Popup);
const condition = (authUser: any) => !!authUser;

export default compose(
  inject("sessionStore"),
  observer,
  withEmailVerification,
  withAuthorization(condition)
)(MyItems);
