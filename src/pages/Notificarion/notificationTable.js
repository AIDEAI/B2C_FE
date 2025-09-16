import React from "react";
import moment from "moment-timezone";
// import ViewIcon from '../../assets/view.svg'
// import EditIcon from '../../assets/edit.svg'
// import DeleteIcon from '../../assets/delete.svg'
// import { useClassContext } from '../../components/context/classContext'

import { useNavigate } from "react-router-dom";

const NotificatioTable = ({
  notification,
  page,
  totalPages,
  handlePageChange,
  getPageNumbers,
}) => {
  const data = JSON.parse(localStorage.getItem("UserData"));
  const navigate = useNavigate();
  const handleNotificationClick = (notification) => {
      navigate(`/b2c/dashboard/sessions`);
    }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'session_type', label: 'Session Type' },
    { key: 'program', label: 'Program' },
    { key: 'paper_type', label: 'Paper Type' },
    { key: 'subjectName', label: 'Subject Name' },
    { key: 'message', label: 'Message' },
  ];
  const visibleColumns = columns?.filter(column => 
    notification?.notifications?.some(notif => notif[column.key] != null)
  );

  return (
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 ">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
            {visibleColumns?.map((column) => (
            <th key={column.key} scope="col" className="px-6 py-3">
              {column.label}
            </th>
          ))}
              {/* <th scope="col" class="px-6 py-3">
                Essay Title
              </th>
              <th scope="col" class="px-6 py-3">
                Teacher Name
              </th>
              <th scope="col" class="px-6 py-3">
                Class Name
              </th>

              <th scope="col" class="px-6 py-3">
                Due Date
              </th>
              <th scope="col" class="px-6 py-3">
                Message
              </th> */}

              
            </tr>
          </thead>
          <tbody>
            {notification?.message !== "No Notification found " ? (
              notification?.notifications?.map((notification, index) => (
                <tr
                  onClick={() => handleNotificationClick(notification)}
                  key={index}
                  class={` ${
                    notification?.read
                      ? "bg-white hover:bg-gray-50"
                      : "bg-slate-200 hover:bg-slate-200"
                  } cursor-pointer  border-b  `}
                >
                    {visibleColumns.map((column) => (
                <td key={column.key} className="px-6 py-2">
                  {(column.key === 'dueDate' && notification?.[column.key] !== null)
                    ? moment.utc(notification[column.key]).format("MM/DD/YYYY, h:mm:ss A")
                    : notification[column.key] || 'N/A'} {/* Show 'N/A' if the value is null or empty */}
                </td>
              ))}
                  {/* <th
                    scope="row"
                    class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap "
                  >
                    {notification?.essayTitle}
                  </th>
                  <td class="px-6 py-2">{notification?.teacherName}</td>
                  <td class="px-6 py-2">{notification?.classroomName}</td>
                  <td class="px-6 py-2">
                
                    {moment
                      .utc(notification?.dueDate)
                      .format("MM/DD/YYYY, h:mm:ss A")}
                  </td>
                  <td class="px-6 py-2">{notification?.message}</td> */}
                </tr>
              ))
            ) : (
              <tr className="w-full h-full flex justify-center items-center">
            <td className="px-6 py-4" colSpan={visibleColumns?.length}>
              <h1 className="text-[12px] font-[500]">No Notification found</h1>
            </td>
          </tr>
              // <tr className="w-full h-full  flex justify-center items-center">
              //   <td class="px-6 py-4">
              //     <h1 className="text-[12px] font-[500]">
              //       No Notification found{" "}
              //     </h1>
              //   </td>
              // </tr>
            )}
          </tbody>
        </table>
      <div className="flex w-full justify-end item-center p-2">
        <nav
          className="isolate inline-flex -space-x-px rounded-md shadow-sm"
          aria-label="Pagination"
        >
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
          >
            <span className="sr-only">Previous</span>
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {getPageNumbers().map((number, index) =>
            number === "..." ? (
              <span
                key={index}
                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
              >
                ...
              </span>
            ) : (
              <button
                key={index}
                onClick={() => handlePageChange(number)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  page === number
                    ? "z-10 bg-[#1da1f2] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2  "
                    : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                }`}
              >
                {number}
              </button>
            )
          )}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
          >
            <span className="sr-only">Next</span>
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default NotificatioTable;
