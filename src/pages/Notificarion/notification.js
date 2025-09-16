import React,{useState,useContext,useEffect} from 'react'

import NotificatioTable from './notificationTable'
import { useGetNotification } from '../../utils/api/userApi'
import { NotificationContext } from '../../context/notificationContext'
import Loader from '../../components/sharedUI/loader'
const Notification = () => {
  const [page,setPage]=useState(1)
  const {notificationRead,setNotificationRead}=useContext(NotificationContext)
    const [searchValue,setSearchValue]=useState('')
    const {data:notification ,refetch ,isPending}=useGetNotification(
      searchValue,
      page,
      notificationRead
    )
    console.log("🚀 ~ Notification ~ notification:", notification)
    // const {notifications }=useContext(NotificationContext)

    useEffect(() => {
      refetch();
    }, [refetch]);

    const handleSearch=(e)=>{
        const value=e.target.value
        setSearchValue(value)
      }
      const totalPages = notification?.pagination?.totalPages || 1;

      const handlePageChange = (newPage) => {
        setPage(newPage);
      };
      const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
    
        if (totalPages <= maxVisiblePages) {
          for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
          }
        } else {
          const leftOffset = Math.max(page - Math.floor(maxVisiblePages / 2), 1);
          const rightOffset = Math.min(leftOffset + maxVisiblePages - 1, totalPages);
    
          if (leftOffset > 1) pageNumbers.push(1, '...');
          for (let i = leftOffset; i <= rightOffset; i++) {
            pageNumbers.push(i);
          }
          if (rightOffset < totalPages) pageNumbers.push('...', totalPages);
        }
    
        return pageNumbers;
      };
  return (
    <>
    {isPending  && <Loader/>}
    <div className='p-5'>
    <div class="flex justify-end items-center gap-2 pb-4 bg-white ">
    <label for="table-search" class="sr-only">Search</label>
    <div class="relative ">
        <div class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
        </div>
        <input value={searchValue} onChange={handleSearch} type="text" id="table-search" class="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500" placeholder="Search By Name"/>
    </div>
</div>
    <NotificatioTable  totalPages={totalPages} notification={notification} page={page} handlePageChange={handlePageChange} getPageNumbers={getPageNumbers} />
  
</div>
</>
  )
}

export default Notification
