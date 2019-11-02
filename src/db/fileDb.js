import firebase from "@firebase/app";
import "@firebase/storage";

export const uploadDocument = (file, path, callback) => {
  const pushId = firebase
    .database()
    .ref()
    .push().key;

  let docRef;
  try {
    //not yet configured
    docRef = firebase.storage().ref(`${path}/${pushId}`);
  } catch (err) {
    return callback(err);
  }

  const blob = new Blob([file], { type: "image/jpeg" });

  const uploadTask = docRef.put(blob);

  uploadTask.on(
    "state_changed",
    snapshot => {
      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          console.log("Upload is paused");
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          console.log("Upload is running");
          break;
        default:
          break;
      }
    },
    error => {
      callback(error);
    },
    () => {
      // Handle successful uploads on complete
      // For instance, get the download URL: https://firebasestorage.googleapis.com/...
      uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
        console.log("File available at", downloadURL);
        const response = {
          url: downloadURL,
          id: pushId
        };
        callback(null, response);
      });
    }
  );
};

export const uploadImage = (image, callback) => {
  if (!image) throw new Error("Image must exist.");
  if (!["image/jpeg", "image/png"].includes(image.type)) {
    return callback("Legal images include: jpegs, png");
  }

  uploadDocument(image, "images/", (err, res) =>
    err ? callback(err) : callback(null, res.url)
  );
};
