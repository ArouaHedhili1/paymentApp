import React from "react";
import colors from "../styles/colors";
const Line = (props) => {
  const { amount, account, name, transfer_data, created, metadata } = props;

  const condititon = amount > 120;

  return condititon ? (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "3px",
      }}
    >
      <div
        style={{
          fontFamily: "Gilroy",
          fontWeight: "normal",
          fontSize: 16,
        }}
      >
        {transfer_data?.destination === account && metadata.product}
      </div>

      <div
        style={{
          fontFamily: "Gilroy",
          fontWeight: "normal",
          fontSize: 16,
        }}
      >
        {transfer_data?.destination === account &&
          `-Paiement non passé (${amount / 100}€)`}
      </div>
      {transfer_data?.destination === account && (
        <button
          style={{
            border: "2px solid #FF938C",
            backgroundColor: colors.blanc,
            borderRadius: "20px",
            width: "100px",
            height: "3px",
            marginRight: "200px",
          }}
        >
          <p
            style={{
              color: colors.rouge,
              fontFamily: "Gilroy",
              fontWeight: "normal",
              fontSize: 12,
              marginTop: "-6px",
            }}
          >
            en cours
          </p>
        </button>
      )}

      <div
        style={{
          fontFamily: "Gilroy",
          fontWeight: "normal",
          fontSize: 16,
        }}
      >
        {transfer_data?.destination === account &&
          `le ${new Date(created * 1000).toLocaleDateString()}`}
      </div>
    </div>
  ) : null;
};
export default Line;
