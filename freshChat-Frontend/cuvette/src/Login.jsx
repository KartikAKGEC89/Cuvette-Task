import React, { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import { Link } from "react-router-dom";

const Login = ({ userType }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await axios.post("http://localhost:8080/auth/google", {
        token: idToken,
        userType,
        isRegistering,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userType", response.data.user.userType);
      localStorage.setItem("email", result.user.email);

      alert(response.data.message);

      if(response.data.user.userType === "Company") {
        window.location.href = "/company-dashboard";
      } else {  
        window.location.href = "/user-dashboard";
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      alert(error.response?.data?.error || "An error occurred!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col w-full max-w-md px-6 py-10 bg-white rounded-lg shadow-lg sm:px-8 md:px-10 lg:px-12">
        <div className="self-center mb-6 text-2xl font-semibold text-gray-700">
          {isRegistering ? "Register" : "Login"} to Your Account
        </div>

        <div className="flex gap-4 items-center mb-8">
          <button
            type="button"
            onClick={handleAuth}
            className="py-2 px-4 flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
          >
            <svg width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                <path d="M896 786h725q12 67 12 128 0 217-91 387.5t-259.5 266.5-386.5 96q-157 0-299-60.5t-245-163.5-163.5-245-60.5-299 60.5-299 163.5-245 245-163.5 299-60.5q300 0 515 201l-209 201q-123-119-306-119-129 0-238.5 65t-173.5 176.5-64 243.5 64 243.5 173.5 176.5 238.5 65q87 0 160-24t120-60 82-82 51.5-87 22.5-78h-436v-264z">
                </path>
            </svg>
            {isRegistering ? "Register with Google" : "Login with Google"}
          </button>
        </div>

        <div className="flex items-center justify-center mt-6">
          <Link
            to={'/auth/' + (userType === "Company" ? "company" : "user")}
            className="inline-flex items-center text-xs font-medium text-center text-blue-600 hover:text-blue-700"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            <span className="ml-2">
              {isRegistering
                ? "Already have an account?"
                : "You don't have an account?"}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
