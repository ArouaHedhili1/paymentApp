import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import Sepa from "../sepa";
import colors from "../styles/colors";
import logoConsultant from "../assets/images/logo-consultant.png";
import logoClient from "../assets/images/logo-client.png";
import arrowConsultant from "../assets/images/arrow.png";
import blueDesign from "../assets/images/blue-design.png";
import avatar1 from "../assets/images/avatar11.PNG";
import avatar2 from "../assets/images/avatar2.png";
import avatar3 from "../assets/images/avatar3.png";
import arrowClient from "../assets/images/Arrows-Left-icon.png";

function Success() {
  const [type, setType] = useState();
  const [logo, setLogo] = useState();
  const [btnColor, setBtnColor] = useState();
  const [color, setColor] = useState();
  const [portail, setPortail] = useState();
  const [arrow, setArrow] = useState();
  const [backgroundColor, setBackgroundColor] = useState();
  const [mandatText, setMandatText] = useState();
  const [thankText, setThankText] = useState();
  const [first, setFirst] =useState();
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
      setThankText(colors.bleuFoncé);
      setMandatText(colors.grisFoncé);
      setFirst("Bienvenue chez Meltingworks !")
     
    } else if(type === "0") {
      setLogo(logoClient);
      setBtnColor(colors.grisFoncé);
      setColor(colors.blanc);
      setPortail(colors.blanc);
      setArrow(arrowClient);
      setBackgroundColor(colors.vert);
      setThankText(colors.vertFoncé);
      setMandatText(colors.vertFoncé);
      setFirst("Merci !")
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
            <div className="col">
              <p
                style={{
                  margin: "20px 90px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: thankText,
                  textAlign: 'center'
                }}
              >
                {first}
              </p>
              <br />
              <h5
                style={{
                  margin: "0px 10px",
                  fontSize: "14px",
                  fontWeight: "normal",
                  color: mandatText,
                }}
              >
                Votre mandat a bien été signé. Vous allez recevoir un mail de
                confirmation.
              </h5>
            </div>
          </div>
        </div>
      </div>
    </Sepa>
  );
}

export default Success;
