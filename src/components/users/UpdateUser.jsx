import React, { useContext } from "react";

import Form from "../reusable/Form";
import { UserContext } from "../../context";

const fields = {
  iconUrl: "image"
};

const UpdateUser = ({ history }) => {
  const { user } = useContext(UserContext);

  const routeToProfile = () => history.push("/profile/" + user.id);

  return user ? (
    <div className="Updateuser uk-flex uk-flex-center uk-padding">
      <Form
        fields={fields}
        defaultValues={user}
        title="Update User"
        submitText="Save Info"
        onCancel={routeToProfile}
        onSubmit={formData => {
          fields &&
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
