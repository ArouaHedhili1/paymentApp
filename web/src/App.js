import React from "react";
import Error from "./views/error";
import ClientPaiementDetails from "./views/clientPaiementDetails";
import ConsultantPaiementDetails from "./views/consultantPaiementDetails";
import SubHome from "./views/subHome";
import Success from "./views/success";
import AdminInterface from "./views/adminInterface";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/subscription/:id/:type" element={<SubHome />} />
        <Route path="/" element={<Navigate replace to="/subscription/:id/:type" />} />

        <Route
          path="/client-paiement-details/:id"
          element={
            <>
              <ClientPaiementDetails />
            </>
          }
        />

        <Route
          path="/consultant-paiement-details/:id"
          element={
            <>
              <ConsultantPaiementDetails />
            </>
          }
        />
        {/* <Route path="/paiement-details" element={<Navigate replace to="/paiement-details/:id" />} /> */}
        <Route path="/success/:type" element={<Success />}></Route>
        <Route path="/error/:type" element={<Error />}></Route>

        <Route path="/adminInterface/:id" element={<AdminInterface />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
