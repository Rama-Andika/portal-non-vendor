import React from "react";
import { QRCodeSVG } from "qrcode.react";

type QRCodeProps = {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  fullWidth?: boolean;
};

const QRCodeGenerator: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  fgColor = "#000000",
  bgColor = "#FFFFFF",
  fullWidth = false,
}) => {
  return (
    <QRCodeSVG
      value={value}
      size={fullWidth ? 288 : size}
      fgColor={fgColor}
      bgColor={bgColor}
      level="M" // L, M, Q, H (semakin tinggi semakin tahan error)
      includeMargin={false}
    />
  );
};

export default QRCodeGenerator;
