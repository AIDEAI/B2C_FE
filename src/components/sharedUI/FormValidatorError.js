
import React from 'react'
import ErrorIcon from '../../assets/errorIcon.svg'

const FormValidationError = ({errors}) => {
    return (
        <div className='flex gap-2 items-center mt-2'>
            <img src={ErrorIcon} width={20} alt='error'/>
        <h1 className=' text-[#FF1515] text-[16px] '>
            {errors}
        </h1>
        </div>
    )
}

export default FormValidationError