import React, { Component } from 'react';
import ReactDOM from "react-dom";

import qrcodegen from "./lib/qrcode";
const QRC = qrcodegen.QrCode;

class QRCode extends Component {
  render() {
    const { value } = this.props;
    const encodedValue = QRC.encodeText(value, QRC.Ecc.MEDIUM);

    return <div dangerouslySetInnerHTML={{__html: encodedValue.toSvgString(5)}}></div>
  }
}

export default QRCode