import React from "react";
import { inject, observer } from "mobx-react";
import { withFirebase } from "../Firebase";
import Modal from "react-bootstrap/Modal";
import "./chat.css";
import Container from "react-bootstrap/esm/Container";

class Chat extends React.Component<
  { closePopUp: any; show: boolean; chatId: string; firebase: any },
  any
> {
  constructor(props: any) {
    super(props);

    this.state = {
      items: [],
      msgbox: "",
      msgStack: null,
      msgStackLocal: [],
    };

    this.sendMessage = this.sendMessage.bind(this);
  }

  sendMessage() {
    try {
      this.props.firebase.auth.onAuthStateChanged((user: any) => {
        if (user) {
          this.props.firebase
            .updateChatMessage(
              this.props.chatId,
              this.state.msgbox,
              this.props.firebase.auth.currentUser["uid"]
            )
            .then(() => {
              this.setState({ msgbox: "" }); //just reset the message box on transmission
            })
            .catch(() => {
              //we have an error here.
            });
        }
      });
    } catch (exception) {
      console.log("Error somewhere here", exception);
    }
  }

  onChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  componentDidMount() {
    console.log(this.props.chatId);
    try {
      this.props.firebase.readMsgs(this.props.chatId).then((data: any) => {
        console.log(data.data());
      });
    } catch (exception) {}
  }

  render() {
    return (
      <div>
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
            <Modal.Title>Order {this.props.chatId} Chat</Modal.Title>
          </Modal.Header>
          <Modal.Body className="show-grid">
            <Container> </Container>
          </Modal.Body>
          <Modal.Footer>
            <div className="input-group">
              <input
                type="text"
                id="msgbox"
                name="msgbox"
                className="form-control"
                placeholder="Some message here"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                onChange={this.onChange}
                value={this.state.msgbox}
              ></input>
              <div className="input-group-append">
                <button
                  onClick={this.sendMessage}
                  className="btn btn-info cht-btn"
                  type="button"
                >
                  Send
                </button>
              </div>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

//export default compose(withFirebase, inject("sessionStore"), observer)(Chat);

export default withFirebase(inject("sessionStore")(observer(Chat)));
