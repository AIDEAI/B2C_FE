/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useMutation, useQuery } from "@tanstack/react-query";
import { client } from "./clientApi";
import { toast } from "react-toastify";


export const useLogin = () =>
  useMutation({
    mutationFn: async (data) => {

      const response = await client("auth/login", {
       
        data
      
      });
      // If response is a string, it's an error message
      if (typeof response === "string") {
        throw new Error(response);
      }
      return response;
    },
    onSuccess: (data) => {
      // Store user data
      localStorage.setItem("UserData", JSON.stringify(data));
      localStorage.setItem("Token", JSON.stringify(data.token));
      return data;
    },
    onError: (error) => {
      throw error;
    },
  });



  export const useSignUpStudent = () =>
    useMutation({
      mutationFn: async (data) => {
        return client("auth/register-student", {
          data,
        });
      },
      onSuccess: (response) => {
        // toast?.success(response?.message)
       
        // localStorage.setItem("UserData", JSON.stringify(response.user));
      },
      onError: (error) => {
        console.log("Login failed", error);
      },
    });
  export const useGetFilterPastPapers = (program,subject,paper_type,topic,subtopic,year_min,year_max,page,sessions,variants) =>
    useQuery({
      queryKey: ["getFilterPastPapers",program,subject,paper_type,topic,subtopic,year_min,year_max,page,sessions,variants],
      queryFn: async () => {
        console.log('API Call triggered with params:', {
          program, subject, paper_type, topic, subtopic, year_min, year_max, page, sessions, variants
        });
        
        const params = new URLSearchParams();
        
        // Add basic parameters only when they have values
        if (program) params.append('program', program);
        if (subject) params.append('subject_id', subject);
        if (paper_type) params.append('paper_type', paper_type);
        if (topic) params.append('topic', topic);
        if (subtopic) params.append('subtopic', subtopic);
        if (year_min) params.append('year_min', year_min);
        if (year_max) params.append('year_max', year_max);
        if (sessions) params.append('sessions', sessions);
        if (variants) params.append('variants', variants);
        if (page) params.append('page', page);
        if (page) params.append('limit', '10');
        
        const queryString = params.toString();
        const url = queryString ? `library/get-filters-by-stage?${queryString}` : 'library/get-filters-by-stage';
        
        console.log('Final API URL:', url);
        return await client(url);
      },
      staleTime: 5 * 60 * 1000, // Adjust as needed
      cacheTime: 10 * 60 * 1000, // Adjust as needed
    });

export const useStartSession = () =>
  useMutation({
   mutationFn: async (data) =>{
    return  await client(`sessions/start-session`, {
        data,
      })
    },
    onSuccess: (response) => {
      console.log("🚀 ~ response:", response)
      return response;
    },
    onError: (error) => {
      console.log("Login failed", error);
    },
  });

export const useGetSession = (sessionID) =>
  useQuery({
    queryKey: ["getSession",sessionID],
    queryFn: async () => {
      return await client(`sessions/get-session/${sessionID}`);
    },
  });

export const useGetSessionMutation = () =>
  useMutation({
    mutationFn: async (sessionID) => {
      return await client(`sessions/get-session/${sessionID}`);
    },
  });

  export const useGetAllSessions = (status, page = 1) =>
    useQuery({
      queryKey: ["getAllSessions", status, page],
      queryFn: async () => {
        return await client(`sessions/get-all-sessions?status=${status || ''}&page=${page}`);
      },
    });

    export const useSubmitSession = () =>
      useMutation({
       mutationFn: async (data) =>{
        return  await client(`sessions/submit-session`, {
            data,
          })
        },
        onSuccess: (response) => {
          return response;
        },
        onError: (error) => {
          throw error;
        },
      });


      export const useAutoSaveSession = () => {
        // const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data) => {
            const response = await client("sessions/auto-save", {
              data,
            });
            return response;
          },
          onSuccess: (response) => {
            // queryClient.invalidateQueries(["getClasses"]);
            toast.success(response?.data?.message , {
              position: "bottom-right"
            });
          },
          onError: (error) => {
            console.log("Login failed", error);
          },
        });
      };
    
    
    
      export const useGetDraftSession = (sessionId) =>
        useQuery({
          queryKey: ["getDraftSession", sessionId],
          queryFn: async () =>
            await client(`sessions/get-draft/${sessionId}`),
          enabled: !!sessionId, // Ensure the query runs only if ID is provided
          staleTime: 5 * 60 * 1000, // Adjust as needed
          cacheTime: 10 * 60 * 1000, // Adjust as needed
        });

        export const useGetEvaluation = (sessionId) =>
          useQuery({
            queryKey: ["getEvaluation", sessionId],
            queryFn: async () =>
              await client(`sessions/evaluation/${sessionId}`),
            enabled: !!sessionId, // Ensure the query runs only if ID is provided
            staleTime: 5 * 60 * 1000, // Adjust as needed
            cacheTime: 10 * 60 * 1000, // Adjust as needed
          });

          export const useGetNotification = ( search, page,notificationRead, enabled = true) =>{

            return useQuery({
               queryKey: ["getNotification",  search, page,notificationRead],
               queryFn: async () =>{
               console.log("getNotification queryFn executed"); // Add this line
         
                return await client(
                   `notifications/me?search=${search || ""}&page=${page || 1}&notificationRead=${notificationRead ? 'true' : false}`
                 )},
         
                 // refetchOnWindowFocus: false,
                 //   refetchOnMount: false,
                 //   refetchOnReconnect: false,
                 enabled: enabled, 
                  staleTime: 60000,
                  cacheTime: 3600000
             

             })};

// export const useGetOtp = () =>
//   useMutation(
//     async (email) =>
//       await client(`auth/forgotPassword`, {
//         data: { email },
//       })
//   );

// export const useVerifyOtp = () =>
//   useMutation(
//     async (data) =>
//       await client(`auth/verifyOtpForForgotPassword`, {
//         data,
//       })
//   );

// export const useReSendOtp = () =>
//   useMutation(
//     async (email) =>
//       await client("auth/resendOtp", {
//         data: { email },
//       })
//   );

// export const useResetPassword = () =>
//   useMutation(
//     async (password) =>
//       await client("auth/resetPassword", {
//         data: { password },
//         headers: {
//           Authorization: localStorage.getItem("otp_token") || "",
//         },
//       })
//   );

// export const useChangePassword = () =>
//   useMutation({
//     mutationFn: async (body) => {
//       const oldPassword = body?.oldPassword;
//       const password = body?.password;
//       let token = localStorage.getItem("Token");

//       if (token.startsWith('"') && token.endsWith('"')) {
//         token = token.slice(1, -1);
//       }
//       return client("auth/changePassword", {
//         data: { oldPassword, password },
//         headers: {
//           Authorization: token,
//         },
//       });
//     },
//     onSuccess: (response) => {
//       console.log("Password updated successfully");
//     },
//     onError: (error) => {
//       console.log("Change password failed", error);
//     },
//   });

// export const useUpdateProfile = () =>
//   useMutation({
//     mutationFn: async (data) => {
//       return client("auth/updateProfile", {
//         data,
//       });
//     },
//     onSuccess: (response) => {
//       console.log(response);
//     },
//     onError: (error) => {
//       console.log("Login failed", error);
//     },
//   });

//hook for image file upload
// export const useImageUpload = () =>
//   useMutation({
//     mutationFn: async (file) => {
//       const formData = new FormData();
//       formData.append("file", file);
//       return imageUploadClient("media-upload/mediaFiles/image", {
//         data: formData,
//       });
//     },
//     onSuccess: (response) => {
//       console.log("Image uploaded successfully:", response);
//     },
//     onError: (error) => {
//       console.error("Image upload failed", error);
//     },
//   });
