'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from "js-cookie";
import { BsStars } from "react-icons/bs";
import { IoIosLogOut } from "react-icons/io";
import { IoDocumentTextOutline } from "react-icons/io5";
import { LuHistory } from "react-icons/lu";

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

const Navbar = () => {
  const [cookie, setCookie] = useState<string | undefined>(undefined);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [openProfile, setOpenProfile] = useState<boolean>(false)
  const router = useRouter();

  useEffect(() => {
    const fetchedCookie = Cookies.get('promtgov-token');
    setCookie(fetchedCookie);

    if (!fetchedCookie) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${fetchedCookie}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data: UserProfile = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const logoutGoogle = async () => {
    Cookies.remove('promtgov-token');
    router.push('/');
  };


  return (
    <nav className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
      <div onClick={() => router.push("/")} className="flex text-lg font-extrabold text-[#1d4ed8] cursor-pointer">
        PromptGov AI
        <BsStars size={20} />
      </div>
      <div className="flex items-center space-x-4">

        {cookie && userProfile ? (
          <div className="relative flex items-center justify-end space-x-2">
            <div className="flex justify-end flex-col items-end">
              <strong>{userProfile.name}</strong>
              <span className="block text-sm text-gray-500">{userProfile.email}</span>
            </div>

            <img
              onClick={() => setOpenProfile((prev) => !prev)}
              src={userProfile.avatar}
              alt="User profile"
              className="w-8 h-8 rounded-full cursor-pointer hover:scale-95"
            />
            {openProfile && (
              <div className="flex flex-col absolute top-12 right-0 bg-white shadow-md text-sm">
                <button
                  onClick={() => router.push("/documents")}
                  className="p-2 flex items-center gap-x-1 hover:bg-sky-500 hover:text-white"
                >
                  <IoDocumentTextOutline size={20} />
                  เอกสารทั้งหมด
                </button>
                <hr />
                <button
                  onClick={() => router.push("/documents/mydoc")}
                  className="p-2 flex items-center gap-x-1 hover:bg-sky-500 hover:text-white"
                >
                  <LuHistory size={20} />
                  เอกสารของฉัน
                </button>
                <hr />
                <button
                  onClick={logoutGoogle}
                  className="p-2 flex items-center gap-x-1 hover:bg-red-500 hover:text-white"

                >
                  <IoIosLogOut size={20} />
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>

        ) : (
          <button
            onClick={() => router.push("/auth/login")}
            className="px-4 py-2 bg-[#1d4ed8] text-white rounded-lg hover:opacity-90"
          >
            เข้าสู่ระบบ
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
