import React, { useState } from "react";
import { useLocation, useNavigate ,NavLink} from "react-router-dom";
import Dashboard from '../../assets/dashboard.svg'
import Tool from '../../assets/tools.svg'
import CreateClass from '../../assets/classadd.svg'
import RubricIcon from '../../assets/rubrics.svg'
import ProgramIcon from '../../assets/program.svg'

import Assignment from '../../assets/assignment.svg'
import School2Icon from '../../assets/classadd.svg'
import LibraryIcon from '../../assets/libraryIcon.svg'
import SessionIcon from '../../assets/librarySessions.svg'


const  Sidebar=()=> {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const UserRole =JSON.parse(localStorage.getItem('UserData'))
  console.log("🚀 ~ Sidebar ~ Role:", UserRole)

  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { path: "/b2c/dashboard", name: ("Dashboard"),img:Dashboard },
    { path: "/b2c/dashboard/pastPapers", name: ("PastPapers"),img:LibraryIcon },
    { path: "/b2c/dashboard/sessions", name: ("Sessions"),img:SessionIcon },



  ];

 const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };


  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <aside
    className={`sidebar bg-white border-r border-t border-black-800/20 flex flex-col   transform ${
      isOpen ? "translate-x-0" : "-translate-x-full"
    } lg:translate-x-0 transition-transform duration-100 ease-in-out lg:static absolute z-30 top-15 min-h-screen w-50 lg:w-64`}
    style={{ minWidth: "200px" }}
  >
    <div className=" ">
      <div className="flex justify-center items-center py-5 border-b border-gray-200">
      <h1 className="  text-[20px] font-bold">AIDE AI</h1>

      </div>
      <nav>
        <ul
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "16px",
            gap: "20px",

            marginTop: "20px",
          }}
        >
          {navItems.map(
            ({ path, name,role,img }) => {
              const isAuthorized = !role || role.includes(UserRole?.role);
          return isAuthorized ?
            
              (<li key={path} >
                <NavLink
                  to={path}
                  className="flex items-center text-[#030319] text-[14px] font-Poppins transition hover:font-bold border-b-1 border-gray-400"
                  style={({ isActive }) => {
                    // For Dashboard, only show active when exactly on /b2c/dashboard
                    // For other pages, show active when on their specific path
                    let shouldBeActive = false;
                    if (path === "/b2c/dashboard") {
                      shouldBeActive = pathname === "/b2c/dashboard";
                    } else {
                      shouldBeActive = isActive;
                    }
                    
                    return shouldBeActive
                      ? {
                          boxShadow: "0px 2px 4px 0px #808080",
                          border: "1px solid #808080",
                          background: "#FFFFFF",
                          padding: "10px",
                          fontWeight: "bolder",
                          whiteSpace: "nowrap",
                          borderRadius: "10px",
                          fontSize:"16px"
                          
                        }
                      : { padding: "16px", whiteSpace: "nowrap" }
                  }}
                >
                  <div className="flex gap-2 items-center">

                   <img src={img} alt="img"/>
                  {name}
                  </div>
                </NavLink>
              </li>
            ):null} 
          )}
        </ul>
      </nav>
    </div>
  </aside>
  );
}

export default Sidebar;

