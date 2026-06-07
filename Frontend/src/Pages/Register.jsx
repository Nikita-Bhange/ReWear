import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import * as z from "zod";
import AuthLayout from "../Components/AuthLayout";

const registerSchema = z.object({
  username: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  confirmPassword: z.string(),
  role: z.enum(["user", "admin"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function Register() {
  const navigate = useNavigate();
  const { role: routeRole } = useParams();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: routeRole === "admin" ? "admin" : "user",
    }
  });

  const watchRole = watch("role");

  useEffect(() => {
    setValue("role", routeRole === "admin" ? "admin" : "user");
  }, [routeRole, setValue]);

  const handleRoleChange = (selectedRole) => {
    setValue("role", selectedRole);
    navigate(selectedRole === "admin" ? "/register/admin" : "/register");
  };

  const onSubmit = async (formData) => {
    setServerError("");

    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/register",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        },
        { withCredentials: true }
      );

    navigate(
  `/verify-email?email=${encodeURIComponent(formData.email)}&role=${formData.role}`
);

    } catch (err) {
      console.error("Register error:", err);
      setServerError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed. Please try again."
      );
    }
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100";
  const roleButtonClass = (selectedRole) =>
    `rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
      watchRole === selectedRole
        ? "border-sky-500 bg-sky-50 text-sky-700 shadow-[0_8px_20px_rgba(2,132,199,0.12)]"
        : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
    }`;

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Start with a secure account"
   
    
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className={roleButtonClass("user")}
          onClick={() => handleRoleChange("user")}
        >
          User account
        </button>
        <button
          type="button"
          className={roleButtonClass("admin")}
          onClick={() => handleRoleChange("admin")}
        >
          Admin account
        </button>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {serverError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {serverError}
          </div>
        ) : null}

        <div>
          <label className="text-sm font-medium text-slate-700">Full name</label>
          <input
            {...register("username")}
            type="text"
            placeholder="Enter your name"
            className={inputClass}
          />
          {errors.username ? (
            <p className="mt-2 text-sm text-rose-600">{errors.username.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className={inputClass}
          />
          {errors.email ? (
            <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              {...register("password")}
              type="password"
              placeholder="Create a password"
              className={inputClass}
            />
            {errors.password ? (
              <p className="mt-2 text-sm text-rose-600">{errors.password.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Confirm password</label>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="Repeat password"
              className={inputClass}
            />
            {errors.confirmPassword ? (
              <p className="mt-2 text-sm text-rose-600">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>
        </div>

        <button
          className="w-full rounded-2xl bg-[linear-gradient(135deg,_#0f766e,_#0284c7,_#2563eb)] px-4 py-3 text-base font-semibold text-white shadow-[0_18px_34px_rgba(2,132,199,0.24)] transition hover:-translate-y-0.5"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          to={watchRole === "admin" ? "/login/admin" : "/login"}
          className="font-semibold text-sky-700 hover:text-sky-800"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
