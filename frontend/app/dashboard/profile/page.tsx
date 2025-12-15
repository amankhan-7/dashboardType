"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../lib/api";
import Loader from "../../components/Loader";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  //  Redirect ONLY after loading finishes
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return null; // redirect in progress
  }

  return (
    <div className="h-full flex flex-col justify-between p-6">
      <div>
        <div className="mx-auto max-w-md md:max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 md:p-8 shadow-md transition-shadow hover:shadow-lg">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-2xl font-semibold text-red-600">
              User Profile
            </h2>
            <p className="text-sm text-gray-500">
              Account information and details
            </p>
          </div>

          {/* Content */}
          <div className="space-y-5 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-6 md:space-y-0">
            {/* Name */}
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Name
              </p>
              <p className="text-base md:text-lg font-medium text-gray-900">
                {user.name}
              </p>
            </div>

            {/* Email */}
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Email
              </p>
              <p className="text-sm md:text-base font-medium text-gray-700 break-all">
                {user.email}
              </p>
            </div>

            {/* Member Since */}
            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Member Since
              </p>
              <p className="text-sm font-medium text-gray-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
   <div className="flex flex-row justify-center">
       <button
        onClick={handleLogout}
        className="mt-100 md:mt-70 w-full md:w-60 rounded-full bg-red-600 py-3 text-white font-semibold hover:bg-red-700"
      >
        Logout
      </button>
   </div>
     
    </div>
  );
}
