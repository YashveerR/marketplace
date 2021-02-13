import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";

class Information extends Component<
  { show: boolean; closePopUp: any; firebase: any },
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      searchInput: "",
    };
  }
  onChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value });
  };
  onSubmit = (event: any) => {
    try {
      event.preventDefault();
      if (this.state.terms === false) {
        toast.error("Terms and Conditions are not accepted");
      } else {
        const addr_obj = {
          addr1: this.state.address,
          addr2: this.state.address2,
          sub: this.state.suburb,
          province: this.state.province,
          city: this.state.city,
          zip: this.state.areacode,
          friendlyName: "Home",
        };
        this.props.firebase.doUpdateUser(
          this.props.firebase.auth.currentUser["uid"],
          this.state.name,
          this.state.lastname,
          this.state.email,
          this.state.number,
          addr_obj,
          this.state.terms
        );
      }
      //because this is bound to a function that shows or hides the popup in the main calling thread we
      //are able resolve the call using this callback reference....
      return this.props.closePopUp(false);
    } catch (exception) {
      console.log(exception);
    }
  };

  render() {
    return (
      <>
        <Modal
          show={this.props.show}
          size="lg"
          backdrop="static"
          keyboard={false}
          animation={false}
          onHide={this.props.closePopUp}
          dialogClassName="modal-custom"
        >
          <Modal.Header>
            <Modal.Title> Personal Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form className="form-height" onSubmit={this.onSubmit}>
              <div className="form-row">
                <div className="col-md-3 mb-3 text-class">
                  <input
                    name="name"
                    type="text"
                    className="form-control inputs-adjust "
                    id="validationDefault01"
                    placeholder="First name"
                    required
                    onChange={this.onChange}
                    value={this.state.name || ""}
                  ></input>
                </div>
                <div className="col-md-3 mb-3 text-class">
                  <input
                    name="lastname"
                    type="text"
                    className="form-control inputs-adjust "
                    id="validationDefault02"
                    placeholder="Last name"
                    required
                    onChange={this.onChange}
                    value={this.state.lastname || ""}
                  ></input>
                </div>
                <div className="col-md-5 mb-3 text-class">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span
                        className="input-group-text"
                        id="inputGroupPrepend2"
                      >
                        <FontAwesomeIcon icon={faEnvelope} />
                      </span>
                    </div>
                    <input
                      name="email"
                      type="text"
                      className="form-control inputs-adjust "
                      id="validationDefaultUsername"
                      placeholder="Email"
                      aria-describedby="inputGroupPrepend2"
                      required
                      onChange={this.onChange}
                      value={this.state.email || ""}
                    ></input>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="col-md-3 mb-3 text-class">
                  <input
                    name="number"
                    type="text"
                    className="form-control inputs-adjust "
                    id="validationDefault03"
                    pattern="[0-9]{10}"
                    placeholder="0123456789"
                    required
                    onChange={this.onChange}
                    value={this.state.number || ""}
                  ></input>
                </div>
                <div className="col-md-4 mb-3 text-class">
                  <input
                    name="address"
                    type="text"
                    className="form-control inputs-adjust "
                    id="validationDefault03"
                    placeholder="Address"
                    required
                    onChange={this.onChange}
                    value={this.state.address || ""}
                  ></input>
                </div>
                <div className="col-md-4 mb-3 text-class">
                  <input
                    name="address2"
                    type="text"
                    className="form-control inputs-adjust "
                    id="validationDefault04"
                    placeholder="Address line two"
                    required
                    onChange={this.onChange}
                    value={this.state.address2 || ""}
                  ></input>
                </div>
              </div>
              <div className="form-row"></div>
              <div className="form-row">
                <div className="col-md-4 mb-3 text-class">
                  <input
                    name="province"
                    type="text"
                    className="form-control inputs-adjust "
                    id="validationDefault04"
                    placeholder="Province"
                    required
                    onChange={this.onChange}
                    value={this.state.province || ""}
                  ></input>
                </div>
                <div className="col-md-4 mb-3 text-class">
                  <input
                    name="city"
                    type="text"
                    className="form-control inputs-adjust "
                    id="validationDefault04"
                    placeholder="City"
                    required
                    onChange={this.onChange}
                    value={this.state.city || ""}
                  ></input>
                </div>
                <div className="col-md-4 mb-3 text-class">
                  <input
                    name="suburb"
                    type="text"
                    className="form-control inputs-adjust "
                    id="validationDefault04"
                    placeholder="Suburb"
                    required
                    onChange={this.onChange}
                    value={this.state.suburb || ""}
                  ></input>
                </div>
              </div>
              <div className="form-row">
                <div className="col-md-4 mb-3 text-class">
                  <input
                    name="areacode"
                    type="text"
                    pattern="[0-9]{4}"
                    className="form-control inputs-adjust "
                    id="validationDefault05"
                    placeholder="Area Code"
                    required
                    onChange={this.onChange}
                    value={this.state.areacode || ""}
                  ></input>
                </div>
              </div>
              <div className="form-group form-check">
                {this.state.terms === "on" ? (
                  <div className="text-class">
                    Terms and Conditions accepted.
                  </div>
                ) : (
                  <div className="form-check">
                    <input
                      name="terms"
                      type="checkbox"
                      className="form-check-input btn-submit"
                      id="invalidCheck2"
                      onChange={() => {}}
                      onClick={() =>
                        this.setState({ terms: !this.state.terms })
                      }
                      checked={this.state.terms || ""}
                    ></input>
                    <label className="form-check-label" htmlFor="invalidCheck2">
                      Accept Terms and Conditions
                    </label>
                  </div>
                )}
              </div>
              <button className="btn btn-primary btn-submit" type="submit">
                Submit Information
              </button>
            </form>
          </Modal.Body>
          <Modal.Footer style={{ justifyContent: "flex-start" }}>
            Please take a moment to fill in the above information...
          </Modal.Footer>
        </Modal>
        <ToastContainer
          position="top-center"
          autoClose={10000}
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

export default Information;
