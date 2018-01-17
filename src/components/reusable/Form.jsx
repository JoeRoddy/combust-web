import React, { Component } from "react";

import { uploadDocument } from "../../service/FileService";

export default class Form extends Component {
  state = {};

  submitForm = e => {
    e.preventDefault();
    const { fields, onSubmit } = this.props;
    let formData = {};
    fields &&
      Object.keys(fields).forEach(field => {
        let val = this.state[field];
        if (val || val === false) {
          val = fields[field] === "number" ? parseInt(val, 0) : val;
          formData[camelCase(field)] = val;
        }
      });
    onSubmit(formData);
  };

  uploadImage = field => {
    const image = this.refs[field].files[0];
    if (!image) return;

    const imageErr = "Legal images include: jpegs, png";
    if (!["image/jpeg", "image/png"].includes(image.type)) {
      return this.setState({ errMessage: imageErr });
    }

    uploadDocument(image, "images/", (err, res) => {
      if (err) {
        return this.setState({
          errMessage:
            err.code === "storage/unauthorized"
              ? "User must be logged in to upload files."
              : err.message
        });
      }
      this.setState({ [field]: res.url });
    });
  };

  getInputValue = field => {
    const { defaultValues } = this.props;
    return this.state[field] != null
      ? this.state[field]
      : defaultValues && defaultValues[field] ? defaultValues[field] : "";
  };

  render() {
    const {
      fields,
      defaultValues,
      submitText,
      title,
      onCancel,
      cancelText
    } = this.props;

    return (
      <form onSubmit={this.submitForm} className="Form uk-width-medium">
        <legend className="uk-legend">{title}</legend>
        {fields &&
          Object.keys(fields).map(field => {
            const type = fields[field];
            return (
              <div className="uk-margin" key={field}>
                {type === "text" && (
                  <textarea
                    className="uk-textarea uk-form-width-large"
                    onChange={e => {
                      this.setState({ [field]: e.target.value });
                    }}
                    value={this.getInputValue(field)}
                    placeholder={field}
                  />
                )}
                {(type === "string" || type === "number") && (
                  <input
                    className="uk-input uk-form-width-medium"
                    onChange={e => {
                      this.setState({ [field]: e.target.value });
                    }}
                    placeholder={
                      field.charAt(0).toUpperCase() + field.substring(1)
                    }
                    type={
                      field === "password"
                        ? field
                        : type === "string" ? "text" : "number"
                    }
                    value={this.getInputValue(field)}
                  />
                )}
                {type === "boolean" && (
                  <label>
                    <input
                      className="uk-radio"
                      type="checkbox"
                      name={field}
                      onChange={e =>
                        this.setState({ [field]: e.target.checked })
                      }
                      checked={this.getInputValue(field)}
                    />{" "}
                    {field}
                  </label>
                )}
                {type === "image" && (
                  <span>
                    {this.state[field] ||
                    (defaultValues && defaultValues[field]) ? (
                      <div className="uk-inline-clip uk-transition-toggle">
                        <label>
                          <img
                            src={
                              this.state[field]
                                ? this.state[field]
                                : defaultValues[field]
                            }
                            alt=""
                          />
                          <div className="uk-position-center uk-light profile-uploadIcon">
                            <span
                              className="uk-transition-fade"
                              uk-icon="icon: plus; ratio: 2"
                            />
                          </div>
                          <input
                            onChange={e => this.uploadImage(field)}
                            type="file"
                            ref={field}
                            style={{ display: "none" }}
                          />
                        </label>
                      </div>
                    ) : (
                  <label>
                      
                      <div className="uk-placeholder uk-background-muted uk-width-2-3 uk-text-center">
                        <span uk-icon="icon: image" />
                        {"  " + field}
                      </div>
                    <div className="uk-position-center uk-light profile-uploadIcon">
                      <span
                        className="uk-transition-fade"
                        uk-icon="icon: plus; ratio: 2"
                      />
                    </div>
                    <input
                      onChange={e => this.uploadImage(field)}
                      type="file"
                      ref={field}
                      style={{ display: "none" }}
                    />
                  </label>
                )}
                  </span>
                )}
              </div>
            );
          })}
        <button
          className="uk-button uk-button-default uk-form-width-medium uk-margin-small-bottom"
          onClick={this.submitForm}
        >
          {submitText || "submit"}
        </button>
        {(onCancel || cancelText) && (
          <button
            className="uk-button uk-button-danger uk-form-width-medium uk-margin-small-bottom"
            onClick={onCancel}
          >
            {cancelText || "cancel"}
          </button>
        )}
        {this.props.children}
        {this.state.errMessage && (
          <div className="uk-text-danger uk-text-break uk-margin-small-top">
            {this.state.errMessage}
          </div>
        )}
      </form>
    );
  }
}

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
