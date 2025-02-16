'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

export default function LoginPage() {
  const handleLogin = () => {
    // Replace this function with your login logic
    console.log('Login with Google');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="text-center animate-fadeInRight">
            <div className="mb-6">
              <div className="h-16 w-16 mx-auto bg-gray-200 rounded-full"></div>
            </div>
            <p className="text-gray-600 text-base mb-6">
              เว็บที่ช่วยให้คุณสร้างเอกสารราชการได้ง่ายๆ เพียงไม่กี่คลิก
              ประหยัดเวลาและเอกสารของคุณจะดูเป็นมืออาชีพมากขึ้น!✨
            </p>
            <button
              onClick={handleLogin}
              className="flex items-center justify-center w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              <FontAwesomeIcon icon={faGoogle} className="w-5 h-5 mr-2" /> Login with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
