import Spinner from "./spinner.svg";
import "./style.scss";

export default function Button({
  className,
  primary,
  secondary,
  link,
  secondaryWallet,
  wide,
  small,
  loadingMessage,
  disabled,
  icon,
  tabIndex,
  onClick,
  children,
}) {
  const classes = ["Button", "btn"];

  if (className) {
    classes.push(className);
  }

  if (primary) {
    classes.push("btn-primary");
  } else if (secondary) {
    classes.push("btn-secondary");
  } else if (link) {
    classes.push("btn-link");
  } else if (secondaryWallet) {
    classes.push("btn-secondary bg-none mt-4");
  }

  if (wide) {
    classes.push("Button_wide");
  }
  if (small) {
    classes.push("Button_small");
  }

  const showLoader = loadingMessage;

  return (
    <button
      tabIndex={tabIndex}
      className={classes.join(" ")}
      disabled={disabled || loadingMessage}
      onClick={(e) => onClick(e)}
    >
      {icon && (
        <span className="Button_icon">
          <img src={icon} alt="" />
        </span>
      )}
      {showLoader && (
        <img className="Button_spinner" src={Spinner} alt="Loading..." />
      )}
      {showLoader ? loadingMessage : children}
    </button>
  );
}
