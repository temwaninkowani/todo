/* eslint-disable jsx-a11y/alt-text */
import React, { lazy } from "react";
import mytodolistimage from "../images/pic3.webp"
import { useNavigate } from "react-router-dom";
//import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Outlet } from "react-router-dom";


export const MyNavBar = () => {
    const navbarStyle = {
        backgroundColor: "#58afdd",
        color: "white",
        textAlign: "center",
        padding: "5px",
        fontSize: "24px",
    };


    return (
        <div>
            <nav style={navbarStyle}>
                <h1>My TodoList</h1>
            </nav>
        </div>
    );

};

export const LandingPageImage = () => {
    const imageStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${mytodolistimage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: 0.7,
        zIndex: -1,

    };

    return (
        <div>
            <img style={imageStyle}
            />
        </div>
    );
}

export const Apptext = ({ text, fontSize, fontWeight, top, left }) => {
    const textStyle = {
        position: "absolute",
        top: top,
        left: left,
        color: "black",
        fontFamily: "Arial, sans-serif",
        fontSize: fontSize,
        fontWeight: fontWeight,
    }

    return (
        <div style={textStyle}>
            {text}
        </div>
    )


}







export const MyButton = ({ text, onClick, fontSize = "18px", padding = "12px 24px" }) => {

    const ButtonStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateY(-50%)",
        backgroundColor: "#6abce2",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: fontSize,
        fontWeight: "bold",
        padding: padding,
        cursor: "pointer",
        transition: "0.3s",

    };
    return (
        <button style={ButtonStyle} onClick={onClick}>{text}</button>
    )
}

export function LandingPage() {
    const nav = useNavigate();

    return (
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
            <LandingPageImage></LandingPageImage>
            <Apptext text="myTodolist" fontSize="70px" fontWeight="bold" top="20px" left="20px" />
            <Apptext text="Get things done , today!" fontSize="30px" fontWeight="italic" top="100px" left="20px" />
            <MyButton text="Get Started" onClick={() => nav("/login")} />

        </div>
    )
}