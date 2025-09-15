import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/index";
import Navbar from "../components/header/index";

// import NetworkStatus from "../components/sharedUi/connectionDetector";
const DashboardLayout=()=> {
  return (
   <>
    {/* <NetworkStatus/> */}
    <div className="flex items-start h-screen">
      <Sidebar className="fixed top-0 left-0 h-full w-64" />
      <div className="flex flex-col w-full h-full ">
        <Navbar className="fixed top-0 left-64 right-0 z-10 w-full" />
        <div className="w-full h-full ">
          <Outlet />
        </div>
      </div>
    </div>
  </>
  );
}

export default DashboardLayout;

