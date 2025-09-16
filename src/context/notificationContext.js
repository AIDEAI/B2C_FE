// src/context/NotificationContext.js
import React, { createContext, useState, useEffect } from 'react';
import pusher from '../components/sharedUI/pusher';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { useGetNotification } from '../utils/api/userApi';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {

    const navigate=useNavigate()
    const data=JSON.parse(localStorage.getItem('UserData'))
    const [notifications, setNotifications] = useState([]);
    const [notificationRead,setNotificationRead]=useState(false)
console.log(notificationRead,'notificationRead')
    const {data:ReadNotification, refetch:refetchNotifications}=useGetNotification(
      '',
      1,
      notificationRead
    )
    console.log('notification',ReadNotification)
  const handleOpenNotification=()=>{
        navigate('/b2c/dashboard/notification')
        setNotificationRead(true)
        setNotifications([])
  }
console.log('notification',notifications)

useEffect(() => {
  // Exit if user data is not yet loaded
  if (!data?.role || !data?.userId) return;

 // Determine channel and event based on user role
 let channelName = '';
 let events = [];
//  let shouldSubscribe = false; // Add this flag


 if (data.role === 'student' ) {
   channelName = `student-${data?.userId}`;
   events =['session-created','session-submitted','session-evaluated'] ; 
 } 

 // Subscribe to the determined channel
 const channel = pusher.subscribe(channelName);
 console.log(`Subscribed to channel: ${channelName}`);

 // Bind to the determined event
 events.forEach(eventName => {
 channel.bind(eventName, (notification) => {
    if(notification){
      console.log('Notification received:',notification)
      setNotifications((prev) => [
        ...prev,
        notification
      ]);
      refetchNotifications()
      // toast.info('New notification received!', {
      //   position: "bottom-right"
      // });
    } 
 });
});

 // Handle subscription errors
 channel.bind('pusher:subscription_error', (status) => {
   console.error(`Subscription error on channel ${channelName}:`, status);
 });

 // Cleanup on unmount or when user changes
 return () => {
   pusher.unsubscribe(channelName);
   console.log(`Unsubscribed from channel: ${channelName}`);
 };
}, [data?.role, data?.userId]);

  return (
    <NotificationContext.Provider value={{ReadNotification,notificationRead, notifications,handleOpenNotification,setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};