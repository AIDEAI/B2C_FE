import React, { useState, useContext, useRef, useEffect } from "react";
import adminpic from "../../assets/image.png";
import dropdownIcon from "../../assets/Dropdown.svg";
import { NavLink, useNavigate } from "react-router-dom";
import searchIconSrc from "../../assets/searchIcon.svg";
import NotificationIcon from "../../assets/bellIcon.png";
import { NotificationContext } from "../../context/notificationContext";

import { MdLockOutline } from "react-icons/md";
import CrossIcon from "../../assets/closeIcon.svg";

import Lock from "../../assets/lock.png";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormValidationError from "../../components/sharedUI/FormValidatorError";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../components/sharedUI/loader";
// import { useChangePassword } from "./../../utils/api/authApis";
// import { useComprehensionContext } from "../context/comprehensionContext";

const schema = yup.object().shape({
  oldPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  newPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
});

const Header = () => {
  const navigate = useNavigate();
//   const {resetComprehensionData}=useComprehensionContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectMenue, setelectMenue] = useState("Admin Management");
  const [searchValue, setSearchValue] = useState("");
  const [PasswordModalOpen, setPasswordModalOpen] = useState(false);
  const UserData = JSON.parse(localStorage.getItem("UserData"));
  console.log("🚀 ~ Header ~ UserData:", UserData);
  const { handleOpenNotification, notifications, ReadNotification } = useContext(NotificationContext);

  const dropdownRef = useRef(null);

//   const { mutate: userChangePassword, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (Data) => {
    console.log("🚀 ~ onSubmit ~ data:", Data);
    const data = {
      userId: UserData?.userId,
      currentPassword: Data?.oldPassword,
      newPassword: Data?.newPassword,
    };

    // userChangePassword(data, {
    //   onSuccess: (response) => {
    //     if (response?.success) {
    //       console.log("responseSignup", response);
    //       toast.success(response?.message);
    //       setPasswordModalOpen(false);
    //       handleLogout()
          
    //       reset()
    //     }
    //   },
    //   onError: (error) => {
    //     toast.error(error);
    //     console.log("Login failed", error);
    //   },
    // });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear("UserData");
    localStorage.clear("Token");
    // resetComprehensionData()
    navigate("/b2c/");
  };

  const notificationCount =ReadNotification?.notifications?.filter((item) => !item?.read).length || 0;
  // const notificationCount=ReadNotification?.notifications?.map((item)=>item?.read !== true).length
  console.log("notificationCount", notificationCount);
  return (
    <div className="flex justify-between item-center px-5 shadow-md border-b">
      <nav className="flex justify-end w-full items-center gap-12 lg:gap-6 p-3">
        <div className="relative">
          <div
            onClick={handleOpenNotification}
            className="cursor-pointer rounded-full p-2 bg-gray-200 w-11 h-11 flex justify-center items-center"
          >
            <img src={NotificationIcon} alt="notification" />
          </div>
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1  text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
              {notificationCount}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <img
            style={{ height: "45px", borderRadius: "50%" }}
            src={adminpic}
            alt="Admin"
          />
          <div>
            <p className="text-xl font-bold text-black-800">{UserData?.name}</p>
            <p style={{ color: "#909090" }} className="text-sm font-normal">
              {UserData?.email}
            </p>
          </div>
        </div>

        <div
          ref={dropdownRef}
          style={{
            backgroundColor: "#EEEEEE",
            borderRadius: "50%",
            padding: "10px",
            paddingTop: "14px",
            position: "relative",
          }}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <img src={dropdownIcon} alt="Dropdown" className="max-w-fit" />

          {dropdownOpen && (
            <div className="absolute right-0 top-10 mt-2 w-64 bg-white rounded-lg border border-[#F1F1F1] shadow-lg z-[1000]">
              <ul className="py-1 px-4">
                {/* <li
                      className="border-b border-[#F1F1F1] "
                      onClick={() => setelectMenue("Admin Management")}
                    >
                      <NavLink
                        to="/admin-management"
                        className={`${
                          selectMenue === "Admin Management"
                            ? "text-[#030319] font-[600]"
                            : "text-[#8F92A1]"
                        } block  py-2 text-sm  hover:text-[#030319] transition hover:font-semibold`}
                      >
                        Admin Management
                      </NavLink>
                    </li> */}

                <>
                  {/* <li
                        className="border-b border-[#F1F1F1] "
                        onClick={() => setelectMenue("Change Email")}
                      >
                        <span
                          // onClick={() => setEmailModalOpen(true)}
                          className={`${
                            selectMenue === "Change Email"
                              ? "text-[#030319] font-[600]"
                              : "text-[#8F92A1]"
                          } block  py-2 text-sm   hover:text-[#030319] transition hover:font-semibold`}
                        >
                          Change Email
                        </span>
                      </li> */}
                  <li
                    className="border-b border-[#F1F1F1] "
                    onClick={() => setelectMenue("Change Password")}
                  >
                    <span
                      onClick={() => setPasswordModalOpen(true)}
                      className={`${
                        selectMenue === "Change Password"
                          ? "text-[#030319] font-[600]"
                          : "text-[#8F92A1]"
                      } block cursor-pointer py-2 text-sm   hover:text-[#030319] transition hover:font-semibold`}
                    >
                      Change Password
                    </span>
                  </li>
                  <li onClick={() => setelectMenue("Logout")}>
                    <span
                      onClick={handleLogout}
                      className={`${
                        selectMenue === "Logout"
                          ? "text-[#030319] font-[600]"
                          : "text-[#8F92A1]"
                      } block cursor-pointer py-2 text-sm   hover:text-[#030319] transition hover:font-semibold`}
                    >
                      Logout
                    </span>
                  </li>
                </>
              </ul>
            </div>
          )}
        </div>
      </nav>

      {PasswordModalOpen && (
        <div
          class="relative z-100"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
          ></div>

          <div class="fixed inset-0 z-100 w-screen overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div class="relative transform overflow-hidden rounded-lg bg-white text-center shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 w-full">
                  <div class="flex justify-between items-center border-b border-gray-500">
                    <h1 className="text-[28px] text-[#000000] font-[700] ">
                      Change Password
                    </h1>
                    <img
                      src={CrossIcon}
                      alt="cross"
                      className="cursor-pointer"
                      onClick={() => setPasswordModalOpen(false)}
                    />
                  </div>
                </div>
                <div class="flex flex-col gap-4 justify-center p-5 w-full">
                  <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                      <label
                        className="flex justify-start text-gray-700 text-sm font-bold mb-1"
                        htmlFor=" Old Password"
                      >
                        Old Password
                      </label>
                      <div className="relative">
                        <img
                          src={Lock}
                          alt="lock"
                          className=" absolute z-10 left-2 top-1/2 transform -translate-y-1/2 "
                        />
                        <div className="absolute z-10 left-10 top-1/2 transform -translate-y-1/2 h-12 border-r-4 border-[#FFFFFF]"></div>
                        <input
                          type="password"
                          id="oldPassword"
                          color="gray"
                          size="lg"
                          placeholder="Enter Old Password"
                          style={{
                            backgroundColor: "#F0F0F0",
                            outline: "none",
                          }}
                          className=" w-full py-2.5 pl-12  text-gray-900 rounded-lg  border-none focus:border-none "
                          {...register("oldPassword")}
                          suffixIcon={
                            <button type="button">
                              <MdLockOutline className="text-gray-400 hover:text-gray-600" />
                            </button>
                          }
                        />
                      </div>
                      {errors?.oldPassword && (
                        <FormValidationError
                          errors={errors?.oldPassword?.message}
                        />
                      )}
                    </div>
                    <div className="mb-4">
                      <label
                        className="flex justify-start text-gray-700 text-sm font-bold mb-1"
                        htmlFor=" New  Password"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <img
                          src={Lock}
                          alt="lock"
                          className=" absolute z-10 left-2 top-1/2 transform -translate-y-1/2 "
                        />
                        <div className="absolute z-10 left-10 top-1/2 transform -translate-y-1/2 h-12 border-r-4 border-[#FFFFFF]"></div>
                        <input
                          type="password"
                          id="newPassword"
                          color="gray"
                          size="lg"
                          placeholder="Enter New Password"
                          style={{
                            backgroundColor: "#F0F0F0",
                            outline: "none",
                          }}
                          className=" w-full py-2.5 pl-12  text-gray-900 rounded-lg  border-none focus:border-none "
                          {...register("newPassword")}
                          suffixIcon={
                            <button type="button">
                              <MdLockOutline className="text-gray-400 hover:text-gray-600" />
                            </button>
                          }
                        />
                      </div>
                      {errors?.newPassword && (
                        <FormValidationError
                          errors={errors?.newPassword?.message}
                        />
                      )}
                    </div>
                    <div className="mb-4">
                      <label
                        className="flex justify-start text-gray-700 text-sm font-bold mb-1"
                        htmlFor="Confirm Password"
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
                          type="password"
                          id="confirmPassword"
                          color="gray"
                          size="lg"
                          placeholder="enter confirm Password"
                          style={{
                            backgroundColor: "#F0F0F0",
                            outline: "none",
                          }}
                          className="w-full py-2.5 pl-12  text-gray-900 rounded-lg  border-none focus:border-none "
                          {...register("confirmPassword")}
                          suffixIcon={
                            <button type="button">
                              <MdLockOutline className="text-gray-400 hover:text-gray-600" />
                            </button>
                          }
                        />
                      </div>
                      {errors?.confirmPassword && (
                        <FormValidationError
                          errors={errors?.confirmPassword?.message}
                        />
                      )}
                    </div>
                    <button
                      type="submit"
                      className="w-full mb-2 py-2 bg-[#000000] text-[#FFFFFF] text-[18px] font-[500] normal-case rounded-lg "
                    >
                      Change Password
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* <Logout handleLogoutClose={handleLogoutClose} logoutOpen={logoutOpen}/> */}
    </div>
  );
};

export default Header;
