import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../src/styles/sepa.css";
import "../src/styles/normalize.css";
import colors from './styles/colors';



function AutorisationSepa({ children,color, btnColor, image, avatar, avatar2, avatar3, arrow, design, portail, isSimilar }) {
  let navigate = useNavigate(); 
const routeChange = () =>{ 

  window.location.href = "https://meltingworks.powerappsportals.com"; 
//navigate("https://meltingworks.powerappsportals.com", { replace: true })

}


  return (
    
    <div style={{backgroundColor: color}}>
      <div>
        {/* <a href="https://meltingworks.powerappsportals.com"> */}
        {/* <Link to={window.location.href =  "https://meltingworks.powerappsportals.com"} target="_blank"> */}
          <button id="btn1" className="btn-portail" style={{background: portail}} 
      onClick={routeChange}
          >
            <img className="arrow" src={arrow}/>
            <p style={{ color: btnColor }}>Retour au portail</p>
          </button>{" "}
          {/* </Link> */}
        {/* </a> */}
      </div>
      <div>
        <img className="logo" src={image} />
      </div>
      <div>
        {color === colors.grisFoncé  ?<img
          className="design"
          src={design}
          style={{
            marginLeft: "950px",
            height: "600px",
            width: "399px",
            position: "absolute"
            //backgroundImage: 'url(' + require('./assets/images/blue-design.png') + ')'
          }}
        /> :null}
      </div>
      <div>
        {color === colors.blanc && !isSimilar ?<img
          className="design"
          src={avatar}
          style={{
            marginLeft: "1000px",
            height: "700px",
            width: "350px",
            position: "absolute"
          }}
        /> :null}
      </div>
      <div>
        {color === colors.blanc && !isSimilar ?<img
          className="design"
          src={avatar2}
          style={{
            marginLeft: "-70px",
            marginTop: "450px",
            height: "300px",
            width: "300px",
            position: "absolute"
          }}
        /> :null}
      </div>
      <div>
        {color === colors.blanc && !isSimilar ?<img
          className="design"
          src={avatar3}
          style={{
            marginLeft: "40px",
            marginTop: "550px",
            height: "350px",
            width: "350px",
            position: "absolute"
          }}
        />:null}
      </div>
      <div className="sr-root">{children}</div>
    </div>
  );
}

export default AutorisationSepa;
