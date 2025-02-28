/* eslint-disable no-lone-blocks */
import React from "react";
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import { LandingPage } from "./pages/landing";
import { LoginPage } from "./pages/login";
import { SignUpPage } from "./pages/signup";
import { DashboardPage } from "./pages/dashboard";
import { AuthProvider } from "./pages/authentication";
import { SharedDashboardPage } from "./pages/sharedDashboard";
import { GoogleOAuthProvider } from "@react-oauth/google";

const myCLientId = "396201267498-upamjaqgcf99lp4bbunufumj3j02qjee.apps.googleusercontent.com";


export const AppStyle = {
  background: "#6abce2",
  minHeight: "100vh",
  flexDirection: "column",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: "400",
  fontFamily: "Fira Sans, sans-serif",
  color: "white",
};

function App() {



  return (

    <GoogleOAuthProvider clientId={myCLientId}>
      <AuthProvider>
        <BrowserRouter basename="/todo">
          <Routes>
            <Route exact path="/" element={<LandingPage></LandingPage>}></Route>
            <Route exact path="/login" element={<LoginPage></LoginPage>}></Route>
            <Route exact path="/signup" element={<SignUpPage></SignUpPage>}></Route>
            <Route exact path="/dashboard" element={<DashboardPage></DashboardPage>}></Route>
            <Route exact path="/sharedDashboard" element={<SharedDashboardPage></SharedDashboardPage>}></Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>


  );
}

export default App;
