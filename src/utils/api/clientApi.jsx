import { QueryCache } from "@tanstack/react-query";
import {toast} from 'react-toastify';

const apiURL = process.env.REACT_APP_LOCAL_URL;

const queryCache = new QueryCache({
  onError: (error) => {
    console.log(error);
  },
  onSuccess: (data) => {
    console.log(data);
  },
});
const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    // Get the payload part of the token
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};
const handleTokenExpiration = () => {
  localStorage.removeItem('Token');
  queryCache.clear();
  window.location.href = '/'; 
};
const publicEndpoints = [
  'auth/login',
  'auth/register-student',
//   'recovery/forgot-password',
//   'recovery/reset-password',
//   'notifications/user-notifications',
];

async function client(endpoint,{ data, method, headers: customHeaders, ...customConfig } = {})
{
  const token = localStorage.getItem("Token");
  const isPublicEndpoint = publicEndpoints.some(path => endpoint.includes(path));

  if (!isPublicEndpoint && token) {
    if (!isTokenValid(token)) {
      handleTokenExpiration();
      throw new Error("Token expired. Please login again.");
    }
  }

  const defaultHeaders = {
    "Content-Type": data ? "application/json" : "",
    ...((!isPublicEndpoint && token) && { Authorization: `Bearer ${token}` })

  };
  const config = {
    method: method || (data ? "POST" : "GET"),
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      ...defaultHeaders, 
      ...customHeaders,
    },
    ...customConfig,
  };
  
  try {
    const response = await fetch(`${apiURL}/${endpoint}`, config);
    const responseData = await response.json();
    if (response.ok) {
      return responseData;
    } else if (response.status === 401) {
      queryCache.clear();
      toast.error(responseData?.message || "Unauthorized access", {
        position: "bottom-right"
      });
      // throw new Error("Please re-authenticate.");
    } else {
      toast.error(responseData?.message, {
        position: "bottom-right"
      })
      return responseData;
    }
  } catch (error) {
    // toast.error("An error occurred while processing the request", {
    //   position: "bottom-right"
    // });
    return error;
  }
}

async function imageUploadClient(
  endpoint,
  { data, headers: customHeaders = {}, ...customConfig } = {}
) {
  const token = localStorage.getItem("Token");
  if ( token) {
    if (!isTokenValid(token)) {
      handleTokenExpiration();
      throw new Error("Token expired. Please login again.");
    }
  }
  // Create FormData and append the file
  const defaultHeaders = {
    ...((token) && { Authorization: `Bearer ${token}` })

  };
  // Configure the request
  const config = {
    method: "POST",
    body: data,
    headers: {
      ...defaultHeaders,
      //    "Content-Type":"multipart/form-data" ,
      ...customHeaders,
    },
    ...customConfig,
  };

  try {
    const response = await fetch(`${apiURL}/${endpoint}`, config);
    const responseData = await response.json();
    if (responseData.success) {
      return responseData;
    } else if (response.status === 401) {
      toast.error(responseData?.message || "Unauthorized access");
      // throw new Error("Please re-authenticate.");
    } else {
      toast.error(responseData?.message || "An error occurred");
      // throw new Error(responseData?.message || "Request failed");
    }
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

export { client,imageUploadClient };
