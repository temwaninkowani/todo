import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const GoogleSignIn = () => {
    const navigate = useNavigate();

    const handleLoginSuccess = async (credentialResponse) => {

        const token = credentialResponse.credential;

        //console.log("Google Token:", token); 

        try {
            const response = await fetch("http://localhost:8081/google", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();
            console.log("Backend Response:", data);

            if (response.ok) {
                Cookies.set("authToken", data.token, { expires: 1, secure: true, sameSite: "lax" });
                navigate("/dashboard");
            } else {
                console.error("Login failed:", data.error);
            }
        } catch (error) {
            console.error("Error sending token to backend:", error);
        }
    };

    const handleLoginFailure = (error) => {
        console.log("Google login failed:", error);
    };

    return (
        <div>
            <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginFailure} />
        </div>
    );
};

export default GoogleSignIn;
