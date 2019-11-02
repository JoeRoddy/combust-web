import React, { useState, useRef } from "react";

import firebaseConfig from "../../../db/firebase.config.json";
import { uploadImage } from "../../../db/fileDb";
import "./Form.scss";

export default function Form({
  fields,
  defaultValues,
  onSubmit,
  submitText,
  title,
  onCancel,
  cancelText,
  children
}) {
  const [errMsg, setErrMsg] = useState("");
  const [formVals, formSetter] = useState({});
  const setFormVals = newData => formSetter({ ...formVals, ...newData });

  const submitForm = e => {
    e.preventDefault();
    let formData = {};
    fields &&
      Object.keys(fields).forEach(field => {
        let val = formVals[field];
        if (val || val === false) {
          val = fields[field] === "number" ? parseInt(val, 0) : val;
          formData[camelCase(field)] = val;
        }
      });
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={submitForm}
      className="Form uk-width-medium uk-flex uk-flex-column uk-flex-middle"
    >
      <legend className="uk-legend uk-text-center">{title}</legend>
      {fields &&
        Object.keys(fields).map(field => (
          <FormField
            key={field}
            type={fields[field]}
            value={getInputValue(field, formVals, defaultValues)}
            field={field}
            setFormVals={setFormVals}
            setErrMsg={setErrMsg}
          />
        ))}
      <button
        className="uk-button uk-button-default uk-margin-small"
        onClick={submitForm}
      >
        {submitText || "submit"}
      </button>
      {(onCancel || cancelText) && (
        <button
          className="uk-button uk-button-danger uk-margin-small-bottom"
          onClick={onCancel}
        >
          {cancelText || "cancel"}
        </button>
      )}
      {children}
      {errMsg && (
        <div className="uk-text-danger uk-text-break uk-margin-small-top">
          {errMsg}
        </div>
      )}
    </form>
  );
}

const FormField = ({ type, value, field, setFormVals, setErrMsg }) => {
  const onChange = e => setFormVals({ [field]: e.target.value });
  return (
    <div className="uk-flex uk-flex-column uk-margin-small" key={field}>
      <label className="uk-form-label" htmlFor="form-stacked-text">
        {field}
      </label>
      <div className="uk-form-controls">
        {type === "text" && <FormTextArea onChange={onChange} value={value} />}

        {type === "string" && (
          <FormInput
            onChange={onChange}
            type={field === "password" ? field : "text"}
            value={value}
          />
        )}

        {type === "number" && (
          <FormInput onChange={onChange} type="number" value={value} />
        )}

        {type === "boolean" && (
          <label>
            <input
              className="uk-radio"
              type="checkbox"
              name={field}
              onChange={e => setFormVals({ [field]: e.target.checked })}
              checked={value}
            />
            {field}
          </label>
        )}

        {type === "image" && (
          <ImageInput
            field={field}
            src={value}
            onChange={(image, field) =>
              uploadImage(image, (err, url) =>
                err
                  ? setErrMsg(
                      err.code === "storage/unauthorized" ? (
                        "User must be logged in to upload files."
                      ) : (
                        <EnableFirebaseStorage />
                      )
                    )
                  : setFormVals({ [field]: url })
              )
            }
          />
        )}
      </div>
    </div>
  );
};

const FormInput = ({ type, value, onChange }) => (
  <input
    className="uk-input uk-form-width-medium"
    type={type}
    value={value}
    onChange={onChange}
  />
);

const FormTextArea = ({ onChange, value }) => (
  <textarea
    className="uk-textarea uk-form-width-large"
    value={value}
    onChange={onChange}
  />
);

const ImageInput = ({ src, field, onChange }) => {
  const ref = useRef();

  const InputEl = () => (
    <>
      <div className="uk-position-center uk-light profile-uploadIcon">
        <span className="uk-transition-fade" uk-icon="icon: plus; ratio: 2" />
      </div>
      <input
        type="file"
        ref={ref}
        onChange={() => onChange(ref.current.files[0], field)}
        style={{ display: "none" }}
      />
    </>
  );

  return (
    <span>
      {src ? (
        <div className="uk-inline-clip uk-transition-toggle">
          <label>
            <img src={src} alt="" />
            <InputEl />
          </label>
        </div>
      ) : (
        <label>
          <div className="uk-placeholder uk-background-muted uk-width-2-3 uk-text-center">
            <span uk-icon="icon: image" />
            {"  " + field}
          </div>
          <InputEl />
        </label>
      )}
    </span>
  );
};

const EnableFirebaseStorage = () => (
  <span>
    Err:{" "}
    <a
      className="uk-link"
      target="_blank"
      rel="noopener noreferrer"
      href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/storage/files`}
    >
      Enable storage
    </a>
    , then execute: <code>combust configure {firebaseConfig.projectId}</code>
  </span>
);

const getInputValue = (field, formVals, defaultValues) => {
  const cameled = camelCase(field);

  return formVals[field] != null
    ? formVals[field]
    : defaultValues && defaultValues[field]
    ? defaultValues[field]
    : defaultValues && defaultValues[cameled]
    ? defaultValues[cameled]
    : "";
};

const camelCase = str => {
  if (str.includes(" ")) {
    str = str
      .toLowerCase()
      .replace(/[^A-Za-z0-9]/g, " ")
      .split(" ")
      .reduce((result, word) => result + capitalize(word.toLowerCase()));
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
};

const capitalize = str =>
  str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
