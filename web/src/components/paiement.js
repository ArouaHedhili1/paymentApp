import React from "react";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";

//paiement component
const Paiement = (props) => {
  const { title, description, isExpanded,  color, icon, changeExpand, fontFamily, fontSize, fontWeight } = props;
  return (
    <Accordion defaultExpanded={isExpanded} onChange={changeExpand}>
      <AccordionSummary
        expandIcon={icon}
        sx={{
          backgroundColor: color,
          borderRadius: "5px"
        }}
      >
        <b style={{
          fontFamily: fontFamily, 
          fontSize: fontSize, 
          fontWeight: fontWeight
        }}>{title}</b>
      </AccordionSummary>
      <AccordionDetails>{description}</AccordionDetails>
    </Accordion>
  );
  };

  export default Paiement;