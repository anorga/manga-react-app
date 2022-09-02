import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

function AlertDismiss() {
  const [show, setShow] = useState(true);

  if (show) {
    return (
      <Alert style={{marginTop: "10px"}}variant="warning" onClose={() => setShow(false)} dismissible>
        {/* <Alert.Heading>Warning</Alert.Heading> */}
        <p>
          Clicking on a "Read" button below will redirect you to an external website. Links are hosted by third parties and are not affiliated with this website. Links will be constantly updated to provide a safe and secure experience.
        </p>
      </Alert>
    );
  }
//   return <Button onClick={() => setShow(true)}>Show Alert</Button>;
}

export default AlertDismiss;