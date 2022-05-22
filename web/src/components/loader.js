import React from "react";

import Dialog from "@material-ui/core/Dialog";

import DialogContent from "@material-ui/core/DialogContent";

import DialogContentText from "@material-ui/core/DialogContentText";

import DialogTitle from "@material-ui/core/DialogTitle";

import LinearProgress from "@material-ui/core/LinearProgress";

export default function Loader(props) {
  const {
    loader,
    handleClose,
  } = props;

  return (
    <Dialog
      open={loader.isOpen}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      onClose={handleClose}
    >
      <DialogTitle id="alert-dialog-title">{loader.title}</DialogTitle>

      <DialogContent>
        <LinearProgress style={{ width: "100%" }} />

        <LinearProgress style={{ width: "100%" }} color="secondary" />

        <DialogContentText id="alert-dialog-description">
          {loader.content}
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
 