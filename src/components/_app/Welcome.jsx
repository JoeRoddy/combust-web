import React, { useEffect, useContext, useState } from "react";
import { Link } from "react-router-dom";
import firebase from "@firebase/app";
import "@firebase/database";
import "@firebase/auth";

// import SocialContacts from "../users/SocialContacts";
import { UserContext } from "../../context/UserContext";

export default function Welcome({ history }) {
  const [isFirebaseConfigured, setFirebaseConfigured] = useState(false);
  const [isEmailAuthEnabled, setEmailAuthEnabled] = useState(false);

  const projectId = firebase.app().options.projectId;

  useEffect(() => {
    let mounted = true;
    const isFirebaseConfigured = _isFirebaseConfigured();
    setFirebaseConfigured(isFirebaseConfigured);
    isFirebaseConfigured &&
      _isEmailAuthEnabled().then(
        isEmailAuthEnabled => mounted && setEmailAuthEnabled(isEmailAuthEnabled)
      );
    return () => {
      mounted = false;
    };
  }, []);

  const { user } = useContext(UserContext);

  return (
    <div className="Welcome uk-container uk-margin-medium-top">
      <h1 className="uk-heading-primary">Welcome to your Combust app!</h1>
      <h4>To get started:</h4>
      <hr className="uk-divider-icon" />
      <ul uk-accordion="multiple: true">
        <RenderDropdown
          completed={isFirebaseConfigured}
          title="Configure Firebase"
        >
          <div>
            <ul className="uk-list uk-list-bullet">
              <li>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://accounts.google.com/ServiceLogin/signinchooser?passive=1209600&osid=1&continue=https%3A%2F%2Fconsole.firebase.google.com%2F&followup=https%3A%2F%2Fconsole.firebase.google.com%2F&flowName=GlifWebSignIn&flowEntry=ServiceLogin"
                >
                  Create a firebase project if you don't have one.
                </a>
              </li>
              <li>
                Configure this app with your database:{" "}
                <code>combust configure</code>
              </li>
            </ul>
          </div>
        </RenderDropdown>

        {isFirebaseConfigured && (
          <RenderDropdown
            completed={isEmailAuthEnabled}
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
        {isFirebaseConfigured && isEmailAuthEnabled && (
          <RenderDropdown completed={user} title="Create a User">
            <ToDoItem completed={user}>
              <Link
                to="/signup"
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
        {isFirebaseConfigured && isEmailAuthEnabled && user && (
          <RenderDropdown completed={false} title="Install a Combust Module">
            <p>
              Modules allow you to rapidly add functionality to your app. Try it
              out:
            </p>
            <ToDoItem completed={false}>
              Add <b>friends</b> from your terminal w/ the command:{" "}
              <code>combust install friends</code>
            </ToDoItem>
            <br />
          </RenderDropdown>
        )}
        {/* {isFirebaseConfigured && isEmailAuthEnabled && stores.friendStore && (
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
              To create your own custom modules, you can use the <b>generate</b>{" "}
              command: <br />
              <code>
                combust generate blogs title:string body:text introImg:image
              </code>
            </p>
            <p>You're ready to start experimenting. Good luck!</p>
          </RenderDropdown>
        )} */}
      </ul>
      {/* <SocialContacts histo ry={history} /> */}
    </div>
  );
}

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

const _isFirebaseConfigured = () => {
  try {
    firebase.database();
    return true;
    // const projectId = firebase.app().options.projectId;
    // this.projectId = projectId;
  } catch (err) {
    return false;
  }
};

const _isEmailAuthEnabled = () => {
  return new Promise(resolve => {
    const authEnabledForApp =
      firebase.app().options.projectId + "_isEmailAuthEnabled";

    const emailAuthVerified = JSON.parse(
      localStorage.getItem(authEnabledForApp)
    );

    if (emailAuthVerified) return resolve(true);

    const testEmail = "comsttests@combust.com";
    firebase
      .auth()
      .createUserWithEmailAndPassword(testEmail, "sparky")
      .then(() => {
        localStorage.setItem(authEnabledForApp, true);
        return resolve(true);
      })
      .catch(error => {
        console.log("err:", error);

        let isEmailAuthEnabled = error.code === "auth/email-already-in-use";
        localStorage.setItem(authEnabledForApp, isEmailAuthEnabled);
        return resolve(isEmailAuthEnabled);
      })
      .then(() => {
        const user = firebase.auth().currentUser;
        if (user && user.email === testEmail) {
          user.delete();
        }
      });
  });
};
