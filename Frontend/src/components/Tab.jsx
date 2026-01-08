import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import prof_img from '../assets/images/user.png'
const Tab = ({ totalCompleted, currentStreak }) => {
  const [avatarError, setAvatarError] = useState(false)

  return (
    <div className='bg-white h-16 w-full border-b-2 border-red-500 flex items-center justify-between px-4'>
      <div className='shrink-0 pl-2'>
        <h1 className='text-2xl font-bold'>SkillForge</h1>
      </div>
      <nav className='flex justify-end w-full '>
        <ul className='flex flex-row justify-end w-80 gap-5   text-lg text-gray-700'>
          <li><a className='hover:text-gray-900 mr-3' href="/home">Home</a></li>
          <li>
            <Link
              to="/progress"
              state={{ currentStreak }}
              className="hover:text-gray-900 mr-5"
            >
              Progress
            </Link>
          </li>

        </ul>
      </nav>
      <div className='flex items-center gap-3 pr-2' >
        <Link to='/profile' state={{ totalCompleted }}>
          {!avatarError ? (
            <img
              src={prof_img}
              alt='profile'
              className='w-10 h-10 rounded-full object-cover ring-2 ring-gray-200'
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className='w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 ring-2 ring-gray-200' aria-label='profile placeholder' />
          )}
        </Link>

      </div>
    </div>
  )
}

export default Tab

