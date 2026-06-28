import React, { useContext, useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import axios from "axios";
import { UserContext } from "../Context/User";

const UserInfo = () => {
  const { user } = useContext(UserContext);
  const userId = user?.id || user?.userId || null;

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    address: "",
    city: "",
    pincode: "",
    state: "",
    contact: "",
  });

  useEffect(() => {
    if (!userId) return;
    // fetch existing address
    const fetchAddress = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:8000/api/profile/address/${userId}`, { withCredentials: true });
        if (res.data && res.data.address) {
          setForm(res.data.address);
        }
      } catch (err) {
        console.error("Failed to fetch address", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAddress();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleToggle = async () => {
    // If currently editing, save
    if (editing) {
      // ensure we have a user id
      if (!userId) {
        alert("You must be logged in to save address");
        return;
      }

      // submit
      try {
        setLoading(true);
        const payload = { userid: Number(userId), ...form };
        console.debug("Saving address payload:", payload);
        const res = await axios.put("http://localhost:8000/api/profile/address", payload, { withCredentials: true });
        if (res.status === 200) {
          setEditing(false);
        } else {
          console.error("Unexpected response", res);
          alert("Save failed");
        }
      } catch (err) {
        console.error("Save error", err.response || err);
        const msg = err.response?.data?.message || "Error saving address";
        alert(msg);
      } finally {
        setLoading(false);
      }
    } else {
      // enable editing
      setEditing(true);
    }
  };

  return (
    <>
      <form className="m-5 mt-8 text-gray-800 space-y-4" onSubmit={(e) => e.preventDefault()}>
        <label className="font-bold ">Address:</label>
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          disabled={!editing}
          className="border p-2 rounded w-full"
        />

        <div className="flex flex-row gap-5">
          <div className=" w-1/2">
            <label className="font-bold ">City:</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              disabled={!editing}
              className="border w-full  p-2 rounded"
            />
          </div>
          <div className="w-1/2">
            <label className="font-bold "  >Pincode:</label>
            <input
              type="text"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              disabled={!editing}
              className="border w-full p-2 rounded"
            />

          </div>
        </div>
        <div className="flex flex-row gap-5">
          <div className=" w-1/2">
            <label className="font-bold ">State:</label>
            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              disabled={!editing}
              className="border w-full  p-2 rounded"
            />
          </div>
          <div className="w-1/2">
            <label className="font-bold ">Contact:</label>
            <input
              type="phone"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              disabled={!editing}
              className="border w-full p-2 rounded"
            />

          </div>
        </div>
      </form>

      <div className="flex justify-end mt-4">
        {editing ? (
          <DoneIcon
            onClick={handleToggle}
            className={`cursor-pointer text-green-500 ${loading ? "opacity-50 pointer-events-none" : ""}`}
          />
        ) : (
          <EditIcon
            onClick={handleToggle}
            className="cursor-pointer text-blue-500"
          />
        )}
      </div>
    </>
  );
};

export default UserInfo;