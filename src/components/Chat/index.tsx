import React from "react";
import { inject, observer } from "mobx-react";
import { withFirebase } from "../Firebase";
import Modal from "react-bootstrap/Modal";
import "./chat.css";
import Container from "react-bootstrap/esm/Container";
import { v4 as uuidv4 } from "uuid";

class Chat extends React.Component<
  {
    closePopUp: any;
    show: boolean;
    chatId: string;
    itemId: string;
    firebase: any;
  },
  any
> {
  db: any;
  unsubscribe: any;
  constructor(props: any) {
    super(props);

    this.state = {
      items: [],
      msgbox: "",
      msgStack: {},
      userIdLocal: "",
      dataDl: false,
      itemTitle: "",
    };

    this.db = this.props.firebase.db;
    this.sendMessage = this.sendMessage.bind(this);
    this.handleExit = this.handleExit.bind(this);
  }

  handleExit() {
    //call firestore function here to alert user of new messages
    var sendNotifications = this.props.firebase.functions.httpscallable(
      "sendNewChatAlert"
    );
    sendNotifications({
      text: JSON.stringify({
        recipientOrderNo: this.props.chatId,
        recipientId:
          this.state.userIdLocal === this.state.msgStack.Person1
            ? this.state.msgStack.Person2
            : this.state.msgStack.Person1,
        itemName: this.state.itemTitle,
      }),
      context: "Nothing to see here",
    }).then(() => {
      //there is no return value for meow....
    });
  }
  sendMessage() {
    try {
      if (this.state.msgbox !== "") {
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
      }
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
      this.unsubscribe = this.db
        .collection("chat")
        .doc(this.props.chatId)
        .onSnapshot((snapshot: any) => {
          this.setState({ msgStack: snapshot.data(), dataDl: true });
        });

      this.props.firebase.auth.onAuthStateChanged((user: any) => {
        if (user) {
          this.setState({
            userIdLocal: this.props.firebase.auth.currentUser["uid"],
          });
        }
      });
      this.props.firebase.readUserItem(this.props.itemId).then((doc: any) => {
        this.setState({ itemTitle: doc.data().Title });
      });
    } catch (exception) {}
  }

  componentWillUnmount() {
    this.unsubscribe();
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
          onExiting={this.handleExit}
        >
          <Modal.Header closeButton>
            <Modal.Title>Order {this.props.chatId} Chat</Modal.Title>
          </Modal.Header>
          <Modal.Body className="show-grid">
            <Container>
              <div className="overflow-auto">
                {this.state.dataDl ? (
                  <>
                    {this.state.msgStack.messages.map(
                      (data: any, index: number) => {
                        return data.sender === this.state.userIdLocal ? (
                          <div className="bubble-contain right" key={index}>
                            <div key={uuidv4()} className="bubble right-color">
                              {" "}
                              {data.msg}{" "}
                            </div>
                          </div>
                        ) : (
                          <div className="bubble-contain left" key={index}>
                            <div key={uuidv4()} className="bubble left-color">
                              {" "}
                              {data.msg}{" "}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </>
                ) : (
                  "No messages for this order!"
                )}
              </div>
            </Container>
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
