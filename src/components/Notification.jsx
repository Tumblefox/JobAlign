import React from 'react';
import SlAlert from '@shoelace-style/shoelace/dist/react/alert';
import SlIcon from '@shoelace-style/shoelace/dist/react/icon';
import DOMPurify from 'dompurify';

const Notification = ({type = "primary", message = "", onSlAfterHide}) => {

  let iconName = "info-circle";
  switch (type) {
    case "success":
      iconName = "check2-circle"
      break;
    case "warning":
      iconName = "exclamation-triangle"
      break;
    case "danger":
      iconName = "exclamation-octagon"
      break;
    default:
      iconName = "info-circle";
      break;
  }

  const safeHTML = DOMPurify.sanitize(message);

  return (
    <SlAlert
      variant={type}
      duration="5000"
      open={true}
      closable
      onSlAfterHide={onSlAfterHide}
      className="mb-1 max-w-full w-[480px]"
    >
      <SlIcon slot="icon" name={iconName} />
      <p dangerouslySetInnerHTML={{__html: safeHTML}}></p>
    </SlAlert>
  )
};

export default Notification;
