import React, { useEffect, useState } from "react";
import {
  Input,
  Button,
  Checkbox,
  Typography,
  Select,
  Option,
} from "@material-tailwind/react";
import { Link, useSearchParams } from "react-router-dom";
import { MdEmail, MdLockOutline,MdVisibility, MdVisibilityOff } from "react-icons/md";
import SideImage from "../../assets/sideRing.png";
import Logo from "../../assets/logo.svg";
import Lock from "../../assets/lock.png";
import Email from "../../assets/Email.png";
import User from "../../assets/User.png";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormValidationError from "../../components/sharedUI/FormValidatorError";
import * as yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSignUpStudent } from "../../utils/api/userApi";
import Loader from "../../components/sharedUI/loader";
// import apiRequest from "../../utils/api";

const schema = yup.object().shape({
  fullname: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(
      6,
      "Password must be at least 6 characters"
    )
    .required("Password is required"),
  confirmpassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

const SignUpStudent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract query parameters
  const classroom = searchParams.get('classroom');
  const entryTest = searchParams.get('entryTest') ||'false';
  const assignmentId = searchParams.get('assignmentId');

  console.log("Classroom:", classroom);
  console.log("Entry Test:", entryTest);
  console.log("Assignment ID:", assignmentId);
    const { mutate: studentSignup ,isPending} = useSignUpStudent();
  
  // Global loading state for assignment operations
  const [isAssignmentLoading, setIsAssignmentLoading] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle the visibility state
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword); // Toggle the visibility state
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (Data) => {
    console.log("🚀 ~ onSubmit ~ data:", Data);
 
    
    const data={
      name:Data?.fullname,
      email:Data?.email,
      password:Data?.password,
     
    }
 
  studentSignup(data, {
      onSuccess: (response) => {
        if(response?.success){
          console.log("🚀 ~ onSubmit ~ response:", response)
          toast.success(response?.message,{position:"bottom-right"})
            
            localStorage.setItem('Token', response?.token);
            localStorage.setItem('UserData', JSON.stringify(response));
            navigate("/b2c/")
          }
        },
    
      onError: (error) => {
      alert(error)
        console.log("Login failed", error);
      },
    });
  };


  return (
    <>
    {isPending ||isAssignmentLoading && <Loader/>}
    <div className="flex justify-center  h-screen ">
      <div className="flex w-full h-screen justify-center items-center">
        <div className="flex flex-grow flex-col  justify-center items-center px-6 lg:px-[6rem] xs:py-0 lg:py-0  max-w-[700px]">
          <div className="w-full flex justify-center items-center">
            {/* <img src={Logo} alt="Crypto Wallet" className="mb-3 " /> */}
          <h1
            variant="h4"
            className="mb-4   text-[40px] font-[700] "
          >
            STUDENT SIGN UP
          </h1>
          </div>
          <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4 w-full">
              <label
                className="block text-gray-700 text-sm font-bold mb-1"
                htmlFor="email"
              >
                Full Name
              </label>
              <div className="relative">
                <img
                  src={User}
                  alt="email"
                  className="absolute z-10 left-2 top-1/2 transform -translate-y-1/2 "
                />
                <div className="absolute z-10 left-10 top-1/2 transform -translate-y-1/2 h-12  border-r-4 border-[#FFFFFF] "></div>
                <input
                  type="text"
                  id="name"
                  size="lg"
                  style={{ backgroundColor: "#FAFAFA", outline: "none" }}
                  placeholder="Name"
                  className="w-full py-2.5 pl-12  text-gray-900 rounded-lg  border-none focus:border-none"
                  {...register("fullname")}
                  // error={!!errors.fullname}
                />
              </div>
              {errors && errors?.fullname && (
                <FormValidationError errors={errors?.fullname?.message} />
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <img
                  src={Email}
                  alt="email"
                  className="absolute z-10 left-2 top-1/2 transform -translate-y-1/2 "
                />
                <div className="absolute z-10 left-10 top-1/2 transform -translate-y-1/2 h-12  border-r-4 border-[#FFFFFF] "></div>
                <input
                  type="email"
                  id="email"
                  size="lg"
                  style={{ backgroundColor: "#FAFAFA", outline: "none" }}
                  placeholder="Email Address"
                  className="w-full py-2.5 pl-12  text-gray-900 rounded-lg border-none focus:border-none"
                  {...register("email")}
                />
              </div>
              {errors?.email && (
                <FormValidationError errors={errors?.email?.message} />
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <img
                  src={Lock}
                  alt="lock"
                  className=" absolute z-10 left-2 top-1/2 transform -translate-y-1/2 "
                />
                <div className="absolute z-10 left-10 top-1/2 transform -translate-y-1/2 h-12 border-r-4 border-[#FFFFFF]"></div>
                <input
                  type={showPassword ? "text" : "password"} // Change input type based on visibility state
                  id="password"
                  color="gray"
                  size="lg"
                  placeholder="Password"
                  style={{ backgroundColor: "#FAFAFA", outline: "none" }}
                  className=" w-full py-2.5 pl-12  text-gray-900 rounded-lg  border-none focus:border-none "
                  {...register("password")}
                  
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
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-1"
                htmlFor="password"
              >
                Confirm Password
              </label>
              <div className="relative">
                <img
                  src={Lock}
                  alt="lock"
                  className="absolute z-10 left-2 top-1/2 transform -translate-y-1/2 "
                />
                <div className="absolute z-10 left-10 top-1/2 transform -translate-y-1/2 h-12 border-r-4 border-[#FFFFFF]"></div>
                <input
                  type={showConfirmPassword ? "text" : "password"} // Change input type based on visibility state
                  id="confirmPassword"
                  color="gray"
                  size="lg"
                  placeholder="Password"
                  style={{ backgroundColor: "#FAFAFA", outline: "none" }}
                  className="w-full py-2.5 pl-12  text-gray-900 rounded-lg  border-none focus:border-none "
                  {...register("confirmpassword")}
                 
                />
                <button type="button" onClick={toggleConfirmPasswordVisibility} className="absolute right-2 top-1/2 transform -translate-y-1/2">
          {showConfirmPassword ? (
            <MdVisibility className="text-gray-400 hover:text-gray-600" />
          ) : (
            <MdVisibilityOff className="text-gray-400 hover:text-gray-600" />
          )}
        </button>
              </div>
              {errors?.confirmpassword && (
                <FormValidationError
                  errors={errors?.confirmpassword?.message}
                />
              )}
            </div>
                        {/* <div class="inline-flex items-center mb-2">
              <label
                class="relative flex items-center p-3 rounded-full cursor-pointer"
                htmlFor="check"
              >
                <input
                  type="checkbox"
                  class="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-[#FE8664] checked:bg-[#FE8664] checked:before:bg-[#FE8664] hover:before:opacity-10"
                  id="check"
                />
                <span class="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="1"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </span>
              </label>
              <label
                class="mt-px font-light text-gray-500 cursor-pointer select-none"
                htmlFor="check"
              >
                I agree to the{" "}
                <strong className="text-black font-medium">
                  Terms & Conditions.
                </strong>
              </label>
            </div> */}
            <button
              type="submit"
              className="w-full mb-2 py-2 bg-[#000000] text-[#FFFFFF] text-[18px] font-[500] normal-case rounded-lg "
            >
              Create Account
            </button>
          </form>
          <h1 variant="small">
            Already have an account?{" "}
            <a href="/b2c/" className="text-[#FE8664] hover:underline">
              Sign In
            </a>
          </h1>
        </div>
       
      </div>
    </div>
    </>
  );
};

export default SignUpStudent;
