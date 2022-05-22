import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./subHome";
import Sepa from "../sepa";
import arrowConsultant from "../assets/images/arrow.png";
import logoConsultant from "../assets/images/logo-consultant.png";
import logoClient from "../assets/images/logo-client.png";
import colors from "../styles/colors";
import avatar1 from "../assets/images/avatar11.PNG";
import avatar2 from "../assets/images/avatar2.png";
import avatar3 from "../assets/images/avatar3.png";
import arrowClient from "../assets/images/Arrows-Left-icon.png";
import blueDesign from "../assets/images/blue-design.png";

function Error() {
  const [type, setType] = useState();
  const [logo, setLogo] = useState();
  const [btnColor, setBtnColor] = useState();
  const [color, setColor] = useState();
  const [portail, setPortail] = useState();
  const [arrow, setArrow] = useState();
  const [backgroundColor, setBackgroundColor] = useState();
  const [errorMsgText, setErrorMsgText] = useState();
  const [errorText, setErrorText] = useState();

  let { type: user_type } = useParams();

  useEffect(() => {
    setType(user_type);
    if (type === "1") {
      setLogo(logoConsultant);
      setBtnColor(colors.blanc);
      setColor(colors.grisFoncé);
      setPortail(colors.grisFoncé);
      setArrow(arrowConsultant);
      setBackgroundColor(colors.blanc);
      setErrorText(colors.rouge);
      setErrorMsgText(colors.grisFoncé);
      
    } else if (type === "0") {
      setLogo(logoClient);
      setBtnColor(colors.grisFoncé);
      setColor(colors.blanc);
      setPortail(colors.blanc);
      setArrow(arrowClient);
      setBackgroundColor(colors.rouge);
      setErrorText(colors.rougeFoncé);
      setErrorMsgText(colors.rougeFoncé);
      
    }
  });

  return (
    <Sepa
      image={logo}
      btnColor={btnColor}
      color={color}
      design={blueDesign}
      portail={portail}
      avatar={avatar1}
      avatar2={avatar2}
      avatar3={avatar3}
      arrow={arrow}
    >
      <div>
        <div
          className="root"
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            maxWidth: "980px",
            padding: "48px",
            alignContent: "center",
            justifyContent: "center",
            height: "20px",
            margin: "250px 170px",
          }}
        >
          <div
            className="sr-main"
            style={{
              backgroundColor: backgroundColor,
              marginTop: "-200px",
              marginRight: "150px",
            }}
          >
            <div className="col" id="error">
              <p
                style={{
                  margin: "20px 110px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: errorText
                }}
              >
                Une erreur est survenue.
              </p>
              <br />
              <h5
                style={{
                  margin: "0px 30px",
                  fontSize: "14px",
                  fontWeight: "normal",
                  color: errorMsgText,
                }}
              >
                Le mandat n'a pas été signé, il semblait qu'il y a une erreur
              </h5>
            </div>
          </div>
        </div>
      </div>
    </Sepa>
  );
}

export default Error;
