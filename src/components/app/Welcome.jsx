import React, { Component } from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";

import welcomeStore from "../../stores/welcomeStore";
import userStore from "../../stores/userStore";
import { stores } from "../../stores/init";
import SocialContacts from "../users/SocialContacts";
import availApps from "../../.combust/availApps.json";

@observer
class Welcome extends Component {
  state = {
    modalText: null
  };

  componentDidMount() {
    welcomeStore.isFirebaseConfigured();
    welcomeStore.isEmailAuthEnabled();
  }

  setModalText = modalText => {
    this.setState({ modalText });
  };

  render() {
    let { firebaseConfigured, emailAuthEnabled, projectId } = welcomeStore;
    const user = userStore.user;

    return (
      <div className="Welcome uk-container uk-margin-medium-top">
        <div className="uk-heading-primary"> Welcome to your Combust app!</div>{" "}
        <h4>To get started:</h4>
        <hr className="uk-divider-icon" />
        <ul uk-accordion="multiple: true">
          <RenderDropdown
            completed={firebaseConfigured}
            title="Configure Firebase"
          >
            {availApps && availApps.length > 0 ? (
              <div>
                <div>Select a Firebase project to link to this app</div>
                <table className="uk-table uk-table-small uk-table-striped uk-table-hover">
                  <caption>Your current apps</caption>
                  <thead>
                    <tr>
                      <th>Project Name</th>
                      <th>Project ID</th>
                      <th>Permissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availApps.map(app => {
                      return (
                        <tr
                          key={app.id}
                          uk-toggle="target: #firebase-app"
                          onClick={e => {
                            this.setModalText(
                              <span>
                                Execute from your terminal: <br />
                                <br />
                                <code>combust configure {app.id}</code>
                              </span>
                            );
                          }}
                        >
                          <td>{app.name}</td>
                          <td>{app.id}</td>
                          <td>{app.role}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <hr className="uk-divider-small" />
                Or:{" "}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create a new Firebase project
                </a>{" "}
                then run <code>combust configure</code>
              </div>
            ) : (
              <div>
                <ul className="uk-list uk-list-bullet">
                  <li>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://accounts.google.com/ServiceLogin/signinchooser?passive=1209600&osid=1&continue=https%3A%2F%2Fconsole.firebase.google.com%2F&followup=https%3A%2F%2Fconsole.firebase.google.com%2F&flowName=GlifWebSignIn&flowEntry=ServiceLogin"
                    >
                      Create a firebase project if you don't have one.
                    </a>{" "}
                  </li>
                  <li>
                    Link your project to this app from the terminal with:{" "}
                    <code>combust configure</code>
                  </li>
                </ul>
              </div>
            )}
          </RenderDropdown>

          {firebaseConfigured && (
            <RenderDropdown
              completed={emailAuthEnabled}
              title="Enable Authentication"
            >
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://console.firebase.google.com/u/0/project/${projectId}/authentication/providers`}
              >
                Enable Email/Password authentication in Firebase
              </a>
              <br /> Afterwards, refresh this page
            </RenderDropdown>
          )}
          {firebaseConfigured && emailAuthEnabled && (
            <RenderDropdown completed={user} title="Create a User">
              <ToDoItem completed={user}>
                <Link
                  to="/register"
                  onClick={e => {
                    if (user) {
                      e.preventDefault();
                      alert("You did that, silly");
                    }
                  }}
                >
                  Create your first user account
                </Link>
              </ToDoItem>
            </RenderDropdown>
          )}
          {firebaseConfigured && emailAuthEnabled && user && (
            <RenderDropdown
              completed={stores.friendStore}
              title="Install a Combust Module"
            >
              <p>
                Modules allow you to rapidly add functionality to your app. Try
                it out:
              </p>
              <ToDoItem completed={stores.friendStore}>
                Add <b>friends</b> from your terminal w/ the command:{" "}
                <code>combust install friends</code>
              </ToDoItem>
              <br />
            </RenderDropdown>
          )}
          {firebaseConfigured && emailAuthEnabled && stores.friendStore && (
            <RenderDropdown title="Go In.">
              <p>
                <a
                  href="https://joeroddy.github.io/combust/modules.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  You can browse popular combust modules here.
                </a>
              </p>
              <p>
                To create your own custom modules, you can use the{" "}
                <b>generate</b> command: <br />
                <code>
                  combust generate blogs title:string body:text introImg:image
                </code>
              </p>
              <p>You're ready to start experimenting. Good luck!</p>
            </RenderDropdown>
          )}
        </ul>
        <SocialContacts history={this.props.history} />
        <div id="firebase-app" uk-modal="true">
          <div className="uk-modal-dialog uk-modal-body">
            <button
              className="uk-modal-close-default"
              type="button"
              uk-close="true"
              title="Close"
              uk-tooltip="true"
            />{" "}
            {this.state.modalText}
          </div>
        </div>
      </div>
    );
  }
}

export default Welcome;

const RenderDropdown = ({ completed, title, children }) => {
  return (
    <li className={completed ? null : "uk-open"}>
      <h3
        className="uk-accordion-title"
        style={completed ? doneStyle : pendingStyle}
      >
        {title}
        {completed && <span style={{ paddingLeft: "10px" }}>✓</span>}
      </h3>
      <div className="uk-accordion-content">{children}</div>
    </li>
  );
};

const ToDoItem = ({ completed, children }) => {
  return (
    <div style={completed ? doneStyle : null}>
      {completed && (
        <span className="uk-margin-small-right" style={doneStyle}>
          ✓
        </span>
      )}
      {children}
    </div>
  );
};

const doneStyle = {
  color: "green"
};
const pendingStyle = {
  color: "#1e87f0"
};
