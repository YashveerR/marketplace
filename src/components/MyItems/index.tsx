import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import { withAuthorization, withEmailVerification } from "../Session";
import { withFirebase } from "../Firebase";
import "./myitems.css";
import { STORECATS } from "../../constants/storeCats";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class MyItems extends Component<{ firebase: any }, any> {
  test_prop: any;
  db: any;
  unsubscribe: any;
  deleted_value: any;
  deletedDoc: any;
  constructor(props: any) {
    super(props);
    this.state = {
      viewform: false,
      toastresponse: "",
      toaststyle: false,
      myItems: [],
      docIds: [],
      itemsDL: false,
      viewFormEdit: false,
      itemIndexToEdit: 0,
      fetchedItems: false,
    };

    this.db = this.props.firebase.db;
    this.delItem = this.delItem.bind(this);
  }

  viewNewItemForm() {
    this.setState({
      viewform: !this.state.viewform,
    });
  }

  viewEditForm(e: any) {
    this.setState({
      itemIndexToEdit: this.state.docIds[e],
    });
    console.log(
      e,
      this.state.itemIndexToEdit,
      this.state.docIds[this.state.itemIndexToEdit]
    );
    this.setState({
      viewFormEdit: !this.state.viewFormEdit,
    });
  }

  delItem(e: any) {
    try {
      this.props.firebase.deleteUserItem(
        this.state.docIds[e],
        this.state.myItems[e].ImgLink0,
        this.state.myItems[e].ImgLink1,
        this.state.myItems[e].ImgLink2
      );
    } catch (exception) {
      alert("Error in deleting user item");
    }
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
    let tempIds: any[] = [];

    let promiseA = new Promise((resolve, reject) => {
      let wait = setTimeout(() => {
        clearTimeout(wait);
        resolve("Promise A win!");
      }, 500);
    });
    //retrieve user items from firebase
    promiseA.then((res: any) => {
      this.setState({ fetchedItems: true });
    });

    try {
      this.unsubscribe = this.db
        .collection("items")
        .where("author", "==", this.props.firebase.auth.currentUser["uid"])
        .onSnapshot((snapshot: any) => {
          snapshot.docChanges().forEach((change: any) => {
            if (change.type === "added") {
              tempArr.push(change.doc.data());
              tempIds.push(change.doc.id);
              this.setState({ docIds: tempIds });
              this.setState({ myItems: tempArr });
              this.setState({ itemsDL: true });
            }
            if (change.type === "modified") {
            }
            if (change.type === "removed") {
              this.deleted_value = change.doc.id;
              this.deletedDoc = change.doc.data();

              tempIds = this.state.docIds.filter(
                (id: any) => id !== this.deleted_value
              );
              console.log("post filter ID's", tempIds);
              tempArr = this.state.myItems.filter(
                (data: any) => data.Title !== this.deletedDoc.Title
              );
              console.log("post filter ID's", tempArr);
              this.setState({ docIds: tempIds });
              this.setState({ myItems: tempArr });
            }
          });
        });
    } catch (exception) {
      alert("Error in subscribing to items");
    }
  }
  componentWillUnmount() {
    //make sure when this component unmounts we destroy the listener
    this.unsubscribe();
  }
  //So we are going to ge the number of user items and display them as cards with their titles here
  //We will have a function that pulls the user cards on load and then populate the below using
  //array populace. Also unclude a button for adding new content.
  render() {
    return (
      <>
        <div>
          {this.state.fetchedItems ? (
            <div className="row row-edit">
              {" "}
              {this.state.itemsDL ? (
                this.state.myItems.map((data: any, index: any) => {
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
                          <button
                            onClick={this.viewEditForm.bind(this, index)}
                            type="button"
                            className="btn"
                          >
                            Edit Item
                          </button>
                          <button
                            className="btn"
                            onClick={() => this.delItem(index)}
                          >
                            Delete Item
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="font-error">
                  {" "}
                  "Nothing to see here... How about we add some items shall we?
                  "{" "}
                </div>
              )}
            </div>
          ) : (
            ""
          )}
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
            closePopup={this.viewNewItemForm.bind(this)}
            toastRetval={this.toastmessage}
            toastType={this.toastresult}
          />
        ) : null}

        {this.state.viewFormEdit ? (
          <PopupBox
            editForm="update"
            index={this.state.itemIndexToEdit}
            editItemId={this.state.docIds}
            closePopup={this.viewEditForm.bind(this)}
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

class Popup extends React.Component<
  {
    firebase: any;
    editForm: any;
    index: any;
    editItemId: any;
    toastType: any;
    toastRetval: any;
    closePopup: any;
  },
  any
> {
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
      publicItem: false,
      editing: false,
      img0: "",
      img1: "",
      img2: "",
    };

    this.imgOnChange = this.imgOnChange.bind(this);
    // this.checkOnChange = this.checkOnChange.bind(this);
  }

  componentDidMount() {
    if (this.props.editForm === "update") {
      console.log("we want to update meow", this.props.editForm);
      this.setState({ editing: true });
      console.log("Item we want to edit", this.props.editItemId);
      console.log("index", this.props.index);

      try {
        this.props.firebase.readUserItem(this.props.index).then((doc: any) => {
          console.log(doc.data().ImgLink0[0]);
          this.setState({ itemTitle: doc.data().Title });
          this.setState({ itemDesc: doc.data().Desc });
          this.setState({ itemPrice: doc.data().Price });
          this.setState({ itemCategory: doc.data().Cat });
          this.setState({ publicItem: doc.data().Status });
          this.setState({ img0: doc.data().ImgLink0 });
          this.setState({ img1: doc.data().ImgLink1 });
          this.setState({ img2: doc.data().ImgLink2 });
        });
      } catch (exception) {
        alert("Error in retrieving item data");
      }
    }
  }
  onSubmit = async (event: any) => {
    event.preventDefault();
    let tempArr: any = [
      this.state.fileOne,
      this.state.fileTwo,
      this.state.fileThree,
    ];
    try {
      Promise.all(
        tempArr.map(async (image: any) => {
          return await this.props.firebase.createImages(
            image,
            this.props.firebase.auth.currentUser["uid"],
            this.state.itemTitle,
            this.state.itemCategory
          );
        })
      ).then(
        (value: any) => {
          console.log("this is supposed to be an array of 3", value);
          if (value[0][0] === "") value[0] = this.state.img0;
          if (value[1][0] === "") value[1] = this.state.img1;
          if (value[2][0] === "") value[2] = this.state.img2;
          if (this.props.editForm === "update") {
            this.props.firebase
              .updateUserItem(
                this.props.index,
                this.state.itemTitle,
                this.state.itemDesc,
                this.state.itemPrice,
                this.state.itemCategory,
                this.state.publicItem,
                value
              )
              .then(() => {
                this.props.toastRetval("Data Successfully Updated");
                this.props.toastType(true);
              });
          } else {
            this.props.firebase
              .createUserItem(
                this.props.firebase.auth.currentUser["uid"],
                this.state.itemTitle,
                this.state.itemDesc,
                this.state.itemPrice,
                this.state.itemCategory,
                this.state.publicItem,
                value
              )
              .then(() => {
                this.props.toastRetval("Data Successfully Uploaded");
                this.props.toastType(true);
              });
          }
        },
        (nonValue) => {
          this.props.toastRetval(nonValue);
          this.props.toastType(false);
        }
      );
    } catch (exceptin) {
      alert("Error in creating item");
    }

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

  checkOnChange = (event: any) => {
    this.setState({ publicItem: event.target.checked });
    console.log(
      "Is this item publi:",
      event.target.checked,
      event.target.value
    );
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
              <div className="form-row">
                <div className="col-md-4 mb-3 text-class">
                  <div className="input-group-prepend">
                    <label
                      className="input-group-text"
                      htmlFor="validationDefault01"
                    >
                      Item Name
                    </label>
                    <input
                      name="itemTitle"
                      type="text"
                      className="form-control input-edit"
                      id="validationDefault01"
                      placeholder="What is the name of the Item?"
                      onChange={this.onChange}
                      value={this.state.itemTitle}
                      required
                    ></input>
                  </div>
                </div>
                <div className="col-md-4 mb-3 text-class">
                  <div className="input-group-prepend">
                    <label
                      className="input-group-text"
                      htmlFor="validationDefault02"
                    >
                      Category
                    </label>
                    <select
                      name="itemCategory"
                      className="custom-select"
                      id="validationDefault02"
                      onChange={this.onChange}
                      value={this.state.itemCategory}
                      required
                    >
                      {STORECATS.map((item, i) => {
                        return <option key={i}>{item} </option>;
                      })}
                    </select>
                  </div>
                </div>
                <div className="col-md-4 mb-3 text-class">
                  <div className="input-group-prepend">
                    <label
                      className="input-group-text"
                      htmlFor="validationDefault03"
                    >
                      Rands
                    </label>
                    <input
                      name="itemPrice"
                      type="text"
                      className="form-control input-edit"
                      id="validationDefault03"
                      placeholder="Item Price Per Day"
                      onChange={this.onChange}
                      value={this.state.itemPrice}
                      required
                    ></input>
                    <div className="input-group-append">
                      <span className="input-group-text">.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-group">
              <div className="input-group-prepend">
                <label
                  className="input-group-text"
                  htmlFor="validationDefault04"
                >
                  Item Description
                </label>
                <textarea
                  name="itemDesc"
                  rows={5}
                  className="form-control input-edit textarea"
                  id="validationDefault04"
                  placeholder="Describe Item here. eg. Fancy Tool box set, spanner sizes 5-25"
                  onChange={this.onChange}
                  value={this.state.itemDesc}
                  required
                ></textarea>
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="col-md-4 mb-3 text-class col-container">
                  <img
                    src={this.state.img0}
                    alt=""
                    className="img-thumbnail img-thumbs-edit"
                    defaultValue=""
                  />
                </div>
                <div className="col-md-4 mb-3 text-class col-container">
                  <img
                    src={this.state.img1}
                    alt=""
                    className="img-thumbnail img-thumbs-edit"
                    defaultValue=""
                  />
                </div>
                <div className="col-md-4 mb-3 text-class col-container">
                  <img
                    src={this.state.img2}
                    alt=""
                    className="img-thumbnail img-thumbs-edit"
                    defaultValue=""
                  />
                </div>
              </div>
              {this.props.editForm === "update" ? (
                <>
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
                </>
              ) : (
                <>
                  <label htmlFor="validationDefault05">
                    Choose at least 3 Images that shows off your Item
                  </label>
                  <input
                    name="fileOne"
                    type="file"
                    className="form-control-file file"
                    id="validationDefault05"
                    onChange={this.imgOnChange}
                    required
                  ></input>
                  <input
                    name="fileTwo"
                    type="file"
                    className="form-control-file file"
                    id="validationDefault05"
                    onChange={this.imgOnChange}
                    required
                  ></input>
                  <input
                    name="fileThree"
                    type="file"
                    className="form-control-file file"
                    id="validationDefault05"
                    onChange={this.imgOnChange}
                    required
                  ></input>
                </>
              )}
            </div>
            <div className="form-group">
              <input
                name="publicItem"
                className="form-check-input check-box-edit"
                type="checkbox"
                id="autoSizingCheck"
                onChange={this.checkOnChange}
                checked={this.state.publicItem}
              ></input>
              <label
                className="form-check-label check-lbl-edit"
                htmlFor="autoSizingCheck"
              >
                Place on Rent?
              </label>
            </div>
            <button
              className="btn btn-secondary btn-edit btn-apart"
              type="submit"
            >
              {this.props.editForm === "update" ? "Update" : "Add"}
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
