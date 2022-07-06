import "./style.scss";
import CloseIcon from "./close.svg";
import { useEffect, useState } from "react";

function ErrorModal({ open, error, onClose }) {
  const [isOpen, setOpen] = useState(open);

  useEffect(() => {
    setOpen(open);

    if (open) {
      // hide the error modal after 7 seconds
      setTimeout(() => {
        setOpen(false);
        onClose();
      }, 7000);
    }
  }, [open, onClose]);

  return (
    <div>
      {isOpen && (
        <div className="ErrorModal">
          <img
            className="ErrorModal_close"
            src={CloseIcon}
            onClick={onClose}
            alt="Close"
          />
          {error && error.toString()}
        </div>
      )}
    </div>
  );
}

export default ErrorModal;
