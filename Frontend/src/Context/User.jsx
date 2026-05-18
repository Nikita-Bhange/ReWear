import React, {createContext, useEffect, useState} from "react";
import axios from "axios";

export const UserContext = createContext()

export const UserContextProvider = ({children}) =>{
  const [user, setUser] = useState(null);

  const login = async (inputs) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/login",
        inputs,
        { withCredentials: true }
      );

        // refresh full user details from /me (login response may be minimal)
        try {
          const me = await axios.get("http://localhost:8000/api/auth/me", { withCredentials: true });
          if (me.data?.user) setUser(me.data.user);
        } catch (e) {
          // fallback to login response
          setUser(res.data.user);
        }

        return { success: true, user: res.data.user };
    } catch (error) {
      const status = error?.response?.status;
      if (status !== 401 && status !== 403) {
        console.error("Login error:", error);
      }
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error };
    }
  };

  // Check if user is already logged in when component mounts
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/auth/me", { withCredentials: true });
        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        const status = error?.response?.status;
        if (status !== 401) {
          console.error("Session check failed:", error);
        }
        setUser(null);
      }
    };
    verifyUser();
  }, []);

  const uploadProfilePhoto = async (file) => {
    try {
      const formData = new FormData();
      formData.append("profile_photo", file);

      const res = await axios.post("http://localhost:8000/api/profile/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      // refresh user after successful upload
      try {
        const me = await axios.get("http://localhost:8000/api/auth/me", { withCredentials: true });
        if (me.data?.user) setUser(me.data.user);
      } catch (e) {
        // If /me fails, try to update profile_photo locally
        if (res.data?.fileUrl) setUser((u) => ({ ...(u || {}), profile_photo: res.data.fileUrl }));
      }

      return { success: true, fileUrl: res.data?.fileUrl };
    } catch (err) {
      console.error("Upload failed", err);
      return { success: false, error: err };
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, uploadProfilePhoto }}>
      {children}
    </UserContext.Provider>
  );
};


  //  const uploadProfilePhoto = async (userId, file) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("profile_photo", file);

  //     const res = await axios.post(`http://localhost:3300/user/upload/${userId}`, formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //       withCredentials: true,
  //     });

  //     if (res.status === 200) {
  //       setInput((prevInput) => ({ ...prevInput, profile_photo: res.data.fileUrl }));
  //       alert("Profile photo uploaded successfully!");
  //     } else {
  //       alert("Failed to upload profile photo.");
  //     }
  //   } catch (error) {
  //     console.error("Error uploading profile photo:", error);
  //     alert("An error occurred while uploading the profile photo.");
  //   }
  // };
    //   const updateProfile = async (userId , updatedData)=>{
    //     const res = await axios.put(`http://localhost:3300/user/update/${userId}`,updatedData,{
    //         withCredentials :true,
    //     });
    //     if (res.status === 200){
    //         setInput(updatedData);
    //         alert("Profile updated successfully")
    //     } else{
    //         alert("Failed to update profile");
    //     }
    // }
