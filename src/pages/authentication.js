import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";


const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);


    // Load user and token from cookies on initial render when page is refreshed
    useEffect(() => {
        const storedUser = Cookies.get("user");
        const storedToken = Cookies.get("auth_token");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
            console.log("Found user in cookie");
        } else {
            console.log("Did not find user in cookie");
        }

        if (storedToken) {
            setToken(storedToken);
            console.log("Found auth token in cookie");
        } else {
            console.log("Did not find auth token");

        }

    }, [],);



    const login = async (email, password) => {

        try {
            const response = await fetch("http://localhost:8081/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            console.log(response);
            const data = await response.json().catch(() => null);
            console.log("Login response:", data);


            if (!response.ok || !data?.token) {
                throw new Error(data?.message || "Login failed");
            }

            setToken(data.token);
            setUser(data.user);


            Cookies.set("user", JSON.stringify(data.user), { expires: 7 });
            Cookies.set("auth_token", data.token, { expires: 1, secure: true, sameSite: "Lax" });

        } catch (error) {
            console.error("Login error:", error.message);
        }
    };



    const logout = async () => {
        try {
            await fetch("http://localhost:8081/logout", {
                method: "POST",
                credentials: "include", // Ensures the cookie is cleared server-side
            });

            Cookies.remove("user");
            Cookies.remove("auth_token");
            setToken(null);
            setUser(null);
            console.log("you have been logged out");
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
