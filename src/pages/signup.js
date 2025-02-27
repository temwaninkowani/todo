import React, { useState } from "react";
import { paragraphStyle } from "./login";
import { Apptext } from "./landing";
import { linkStyle } from "./login";
import { LandingPageImage } from "./landing";
import { Link, useNavigate } from "react-router-dom";
import { TextField } from "./login";
import { FormButton } from "./login";


const Label = ({ text }) => {
    const LabelStyle = {
        color: "black"
    }

    return (
        <h2 style={LabelStyle}>{text}</h2>
    );

}

const MySignUpForm = () => {
    const FormStyle = {
        background: "white",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 0 10px black",
        textAlign: "center",
        width: "400px",
        opacity: "0.9",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    };

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();


    const handleSignUp = async (e) => {
        e.preventDefault();


        try {
            const response = await fetch("http://localhost:8081/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                const userData = await response.json();
                console.log("SignUp successful:", userData);

                navigate("/login");
            } else {
                alert("bad response from backend");
            }
        } catch (error) {
            console.error("Error during sign:", error);
            alert("An error occurred during sign up. Please try again later.");

        }

    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
            <form style={FormStyle} onSubmit={handleSignUp}>
                <Label text="Sign Up"></Label>
                <TextField type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}></TextField>
                <br />
                <TextField type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}></TextField>
                <br />
                <TextField type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}></TextField>
                <p style={paragraphStyle}>
                    Already have an account? <Link to="/login" style={linkStyle}>Sign In here</Link>
                </p>
                <FormButton text="Sign Up" type="submit"></FormButton>
            </form>
        </div>
    )
}


export function SignUpPage() {
    return (
        <div>

            <LandingPageImage></LandingPageImage>
            <Apptext text="myTodolist" fontSize="70px" fontWeight="bold" top="20px" left="20px" />
            <Apptext text="Get things done , today!" fontSize="30px" fontWeight="italic" top="100px" left="20px" />
            <MySignUpForm></MySignUpForm>
        </div>
    )
}