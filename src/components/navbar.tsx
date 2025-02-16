'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
      <div className="text-lg font-semibold text-[#1d4ed8]">Prompt Gov AI</div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">ศูนย์ช่วยเหลือ</span>
        </div>
        <button className="px-4 py-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-green-600">
          เข้าสู่ระบบ
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
