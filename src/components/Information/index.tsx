import React, { Component } from "react";

import Modal from "react-bootstrap/Modal";

class Information extends Component<{ show: boolean; closePopUp: any }, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      searchInput: "",
    };
  }
  onChange = (event: any) => {};
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
          <Modal.Header closeButton>
            <Modal.Title> Personal Information</Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            Complete Sign Up Process, Fill in information...
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default Information;
