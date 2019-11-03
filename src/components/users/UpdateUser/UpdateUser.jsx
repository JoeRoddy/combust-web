import React, { useContext } from "react";

import Form from "../../reusable/Form/Form";
import { UserContext } from "../../../context";
import "./UpdateUser.scss";

const formFields = {
  iconUrl: "image"
};

const UpdateUser = ({ history }) => {
  const { user } = useContext(UserContext);

  const routeToProfile = () => history.push(`/profile/${user.id}`);

  return user ? (
    <div className="UpdateUser uk-flex uk-flex-center uk-padding">
      <Form
        fields={formFields}
        defaultValues={user}
        title="Update User"
        submitText="Save Info"
        onCancel={routeToProfile}
        onSubmit={formData => {
          formFields &&
            Object.keys(formData).forEach(field => {
              const val = formData[field];
              field = field === "profilePic" ? "iconUrl" : field;
              if (val !== null && typeof val !== "undefined") {
                const val = formData[field] || null;
                user[field] = val;
              }
            });
          user.save();
          routeToProfile();
        }}
      />
    </div>
  ) : (
    <span />
  );
};

export default UpdateUser;
