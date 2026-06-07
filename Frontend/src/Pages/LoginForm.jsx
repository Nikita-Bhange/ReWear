import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserContext } from "../Context/User";
import AuthLayout from "../Components/AuthLayout";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
  role: z.enum(["user", "admin"]),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const { role: routeRole } = useParams();
  const { login } = useContext(UserContext);
  const [serverError, setServerError] = useState("");
  const [suggestedRole, setSuggestedRole] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: routeRole === "admin" ? "admin" : "user",
    },
  });

  const watchRole = watch("role");

  useEffect(() => {
    setValue("role", routeRole === "admin" ? "admin" : "user");
  }, [routeRole, setValue]);

  const handleRoleChange = (selectedRole) => {
    setValue("role", selectedRole);
    navigate(selectedRole === "admin" ? "/login/admin" : "/login");
  };

  const onSubmit = async (formData) => {
    setServerError("");
    setSuggestedRole("");

    try {
      const result = await login(formData);
      localStorage.setItem("token", result.token);
        console.log("Login result:", result);
      if (result.success) {
        navigate(result.user?.role === "admin" ? "/admin/dashboard" : "/home");
        return;
      }

      const message =
        result.error?.response?.data?.message ||
        result.error?.response?.data?.error ||
        "Login failed";
      const errorCode = result.error?.response?.data?.code;
      const expectedRole = result.error?.response?.data?.expectedRole;

      setServerError(message);
      setSuggestedRole(errorCode === "ROLE_MISMATCH" ? expectedRole : "");
    } catch (err) {
      console.error("Login error:", err);
      setServerError("Network error. Please try again.");
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
      eyebrow="Sign in"
      title="Welcome back"
      subtitle="Use your registered email and password to open your account."
      sideTitle="Pick up where you left off."
     
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className={roleButtonClass("user")}
          onClick={() => handleRoleChange("user")}
        >
          User login
        </button>
        <button
          type="button"
          className={roleButtonClass("admin")}
          onClick={() => handleRoleChange("admin")}
        >
          Admin login
        </button>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {serverError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {serverError}
          </div>
        ) : null}

        {suggestedRole ? (
          <button
            type="button"
            onClick={() => handleRoleChange(suggestedRole)}
            className="text-left text-sm font-semibold text-sky-700 hover:text-sky-800"
          >
            Continue with the {suggestedRole === "admin" ? "admin" : "shopper"} login instead
          </button>
        ) : null}

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

        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <span className="text-xs text-slate-400">Protected with bcrypt</span>
          </div>
          <input
            {...register("password")}
            type="password"
            placeholder="Enter your password"
            className={inputClass}
          />
          {errors.password ? (
            <p className="mt-2 text-sm text-rose-600">{errors.password.message}</p>
          ) : null}
        </div>

        <button
          className="w-full rounded-2xl bg-[linear-gradient(135deg,_#0f766e,_#0284c7,_#2563eb)] px-4 py-3 text-base font-semibold text-white shadow-[0_18px_34px_rgba(2,132,199,0.24)] transition hover:-translate-y-0.5"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Don't have an account?{" "}
        <Link
          to={watchRole === "admin" ? "/register/admin" : "/register"}
          className="font-semibold text-sky-700 hover:text-sky-800"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginForm;
