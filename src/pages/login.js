import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./authentication";
import { LandingPageImage } from "./landing";
import { Apptext } from "./landing";
import GoogleSignIn from "./googleLogin";


export const TextFieldStyle = {
    height: "25px",
    width: "200px",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "15px",
};

export const TextField = ({ type, placeholder, value, onChange }) => {
    return (
        <div>
            <input
                type={type}
                placeholder={placeholder}
                style={TextFieldStyle}
                value={value}
                onChange={onChange}
                required
            />
        </div>
    );
};

export const paragraphStyle = {
    color: "black",
    textAlign: "center",
};

export const linkStyle = {
    color: "blue",
    textDecoration: "underline",
};

const Label = ({ text }) => {
    const LabelStyle = {
        color: "black"
    };

    return <h2 style={LabelStyle}>{text}</h2>;
};

export const FormButton = ({ text, onClick, fontSize = "18px", padding = "12px 24px" }) => {
    const Bstyle = {
        backgroundColor: "#007BFF",
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
        <button style={Bstyle} onClick={onClick}>{text}</button>
    )


}



export const MyLoginForm = () => {
    const formStyle = {
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

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSignIN = async (e) => {
        e.preventDefault();


        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (error) {
            console.error("Error during login:", error);
            alert("Login failed: Incorrect email or password.");
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
            <form style={formStyle} onSubmit={handleSignIN}>
                <Label text="Sign In"></Label>
                <TextField
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <p style={paragraphStyle}>
                    Don't have an account?{" "}
                    <Link to="/signup" style={linkStyle}>
                        Sign Up Here
                    </Link>
                </p>
                <GoogleSignIn></GoogleSignIn>
                <FormButton text={"sign in"} type="submit"></FormButton>
            </form>
        </div>
    );
};

export function LoginPage() {
    return (
        <div>
            <LandingPageImage></LandingPageImage>
            <Apptext text="myTodolist" fontSize="70px" fontWeight="bold" top="20px" left="20px" />
            <Apptext text="Get things done , today!" fontSize="30px" fontWeight="italic" top="100px" left="20px" />
            <MyLoginForm />
        </div>
    );
}
