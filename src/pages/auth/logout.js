import React from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  Typography,
  Input,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import CloseIcon from "../../assets/closeIcon.svg";

function Logout({  handleLogoutClose, logoutOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear("UserData");
    localStorage.clear("Token");

    handleLogoutClose();
    navigate("/b2c/");
  };
  return (
    <div>
      <Dialog open={logoutOpen} className="bg-[#FFFFFF]  ">
        <DialogHeader>
          <div className="flex justify-between  items-center w-full border-b-2 border-[#F9F9F9] p-2">
            <Typography className="text-[20px] color-[#030319] font-semibold">
              Logout
            </Typography>
            <img
              src={CloseIcon}
              className="cursor-pointer"
              alt="close"
              onClick={handleLogoutClose}
            />
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="mb-2">
            <p className="text-[16px] font-normal text-[#8F92A1]">
              Are you sure you want to end this session?
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleLogoutClose}
              className="w-full mt-4 bg-[#EEEEEE] text-[#363636] rounded-lg normal-case"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              className="w-full mt-4 bg-[#FE8664] rounded-lg normal-case "
            >
              Confirm Logout
            </Button>
          </div>
        </DialogBody>
      </Dialog>
    </div>
  );
}
export default Logout;
