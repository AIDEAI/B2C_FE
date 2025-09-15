/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Card, Input, Button, Typography } from "@material-tailwind/react";
import { MdEmail, MdLockOutline, MdVisibility, MdVisibilityOff } from "react-icons/md";
// import SideImage from "../../assets/sideRing.png";
import Logo from "../../assets/logo.svg";
import Lock from "../../assets/lock.png";
import Email from "../../assets/Email.png";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormValidationError from "../../components/sharedUI/FormValidatorError"
import * as yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../components/sharedUI/loader";
import { useLogin } from "../../utils/api/userApi";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { GoogleLogin } from '@react-oauth/google'; 

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const Login = () => {
  const { mutate: userLogin,isPending} = useLogin();


  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [email, setEmail] = useState("");
  const [password, setPassowrd] = useState("");

  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle the visibility state
  };

  const emailChange = (e) => {
    setEmail(e.target.value);
  };
  const passwordChange = (e) => {
    setPassowrd(e.target.value);
  };

  const navigate = useNavigate();
  const onSubmit = async (data) => {
    try {
      userLogin(data, {
        onSuccess: (response) => {
          // Check if response exists and has expected data
          if (response.success) {
            // toast.success("Logged in successfully");
            navigate("/b2c/dashboard");
          } else {
            // toast.error("Invalid response from server")
          }
        },
        onError: (error) => {
          toast.error(error?.message || "Login failed", {
            position: "bottom-right"
          });
        },
      });
    } catch (error) {
      toast.error(error?.message || "An error occurred", {
        position: "bottom-right"
      });
    }
  

    // const response = await axios.post(`${process.env.REACT_APP_LOCAL_URL}/auth/login`,data)
    // console.log("🚀 ~ onSubmit ~ response:", response)
    // if(response?.status === 200){
    //   navigate('/dashboard')

    // }else{
    //   alert(response?.data?.message)
    // }
  };
  const handleHowToUseAideAI=()=>{
    window.open("https://www.loom.com/share/2deca67f99fe403dac3599baecbb1eac");
  }

  const handleSignUp = () => {
    // toast.info("Progress Underway – Launching Soon",{position: "bottom-right"})
  }

  // Google Sign-In handlers
  const handleGoogleLoginSuccess = async (response) => {
    try {
      console.log('Google Login Response:', response);
      console.log('Google Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
      
      // Check if we have the credential (ID token) from Google
      if (response.code) {
        const res = await axios.post(`${process.env.REACT_APP_LOCAL_URL}/auth/google`, {
          code: response.code,
          redirectUri: "postmessage"

        });
        
        if (res.data.success) {
          localStorage.setItem("UserData", JSON.stringify(res.data));
          localStorage.setItem("Token", JSON.stringify(res.data.token));
          toast.success("Signed in with Google successfully", {
            position: "bottom-right"
          });
          navigate("/b2c/dashboard");
        }
      } else {
        console.error('No credential received from Google');
        toast.error("Google Sign-In failed - No credential received", {
          position: "bottom-right"
        });
      }
    } catch (error) {
      console.error('Error with Google Sign-In:', error);
      toast.error(error?.response?.data?.message || "Google Sign-In failed", {
        position: "bottom-right"
      });
    }
  };

  const handleGoogleLoginError = () => {
    console.log('Google Login Failed');
    toast.error("Google Sign-In failed", {
      position: "bottom-right"
    });
  };
  return (
    <>
    {isPending && <Loader/>}
    <div className="flex justify-center items-center h-screen">
      
      <div className="flex flex-grow flex-col justify-center items-center  px-[6rem] h-[100vh]">
        {/* <img src={Logo} alt="Crypto Wallet" className="mb-4" /> */}
       
        <h1
          variant="h4"
          style={{ fontFamily: "Poppins" }}
          className="mb-6 font-bold text-[40px]  font-Poppins"
        >
          SIGN IN
        </h1>
        <form className="w-[460px] bg-white" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <div
              className="relative "
              style={{ outline: "none", border: "none" }}
            >
              <img
                src={Email}
                alt="email"
                className="absolute z-10 left-2 top-1/2 transform -translate-y-1/2 "
              />
              <div className="absolute  left-10 top-1/2 transform -translate-y-1/2 h-12  border-r-4 border-[#FFFFFF] "></div>
              <input
                type="email"
                id="email"
                size="lg"
                placeholder="Email Address"
                {...register("email")}
                style={{ backgroundColor: "#FAFAFA", outline: "none" }}
                className="w-full pl-12 py-2.5 rounded-lg  text-gray-900 border-none focus:border-none"
              />
            </div>
            {errors?.email && (
              <FormValidationError errors={errors?.email?.message} />
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative outline-none">
              <img
                src={Lock}
                alt="lock"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 "
              />
              <div className="absolute  left-10 top-1/2 transform -translate-y-1/2 h-12 border-r-4 border-[#FFFFFF]"></div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                color="gray"
                size="lg"
                {...register("password")}
                
                placeholder="Password"
                style={{ backgroundColor: "#FAFAFA", outline: "none" }}
                className="w-full pl-12 py-2.5 rounded-lg  text-gray-900 border-none focus:border-none  "
               
              />
                 <button type="button" onClick={togglePasswordVisibility} className="absolute right-2 top-1/2 transform -translate-y-1/2">
          {showPassword ? (
            <MdVisibility className="text-gray-400 hover:text-gray-600" />
          ) : (
            <MdVisibilityOff className="text-gray-400 hover:text-gray-600" />
          )}
        </button>
            </div>
            {errors?.password && (
              <FormValidationError errors={errors?.password?.message} />
            )}
          </div>
          <div className="flex justify-end mb-6">
            <Link to={"/forgot-password"}>
              <h1
                variant="small"
                className="text-right text-[#030319] hover:underline cursor-pointer"
              >
                Forgot Password?
              </h1>
            </Link>
          </div>

          <button
            type="submit"
            size="lg"
            className="w-full mb-2 py-2 bg-[#000000] normal-case text-[#FFFFFF] text-[18px] font-[500] rounded-lg"
          >
            Login
          </button>
        </form>

        {/* Custom Google Sign-In Button */}
        <div className="w-[460px] mb-1">
          <button
            onClick={() => {
              // Trigger Google Sign-In programmatically
              if (window.google && window.google.accounts) {
                window.google.accounts.oauth2.initCodeClient({
                  client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                  scope: 'openid email profile',
                  callback: handleGoogleLoginSuccess
                }).requestCode();
              }
            }}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center px-4 gap-3 transition-colors duration-200"
          >
            {/* Google Logo SVG */}
            <svg width="28" height="28" viewBox="0 0 24 24" className="flex-shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-white font-medium">Sign in with Google</span>
          </button>
        </div>
        <div className="flex flex-col items-center justify-center">

        <h1 variant="small">
          Don’t have an account?{" "}
          <a
          onClick={()=>navigate('/b2c/register/student')}
           className="text-[#FE8664] hover:underline cursor-pointer"
          //  style={{ pointerEvents: 'none' }}
          >
            Sign Up 
          </a>
        </h1>
        {/* <Tippy 
  content="Learn how to signup and join classes with Aide AI"
  placement="bottom"
  animation="fade"
  delay={[200, 0]} // [show delay, hide delay]
  className="tooltip-custom" // if you want to add custom styles
>
        <h1 variant="small" className="text-green-500 hover:underline cursor-pointer font-bold text-lg" onClick={handleHowToUseAideAI}>How to Use Aide AI</h1>
         <span className="text-[#FE8664]">Use the Provided Credentials for Login</span> 
        </Tippy> */}
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;
