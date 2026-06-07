import React from "react";

const AuthLayout = ({
  title,
  subtitle,
  eyebrow,
  sideTitle,
  sideText,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dff7ff,_#f8fafc_42%,_#eff6ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[32px] border border-white/70 bg-white/75 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
        <aside className="relative hidden overflow-hidden bg-[linear-gradient(160deg,_#0f766e_0%,_#0284c7_45%,_#1d4ed8_100%)] p-10 text-white md:flex md:flex-col md:justify-between lg:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.18),_transparent_26%)]" />
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/75">
              ReWear Marketplace
            </p>
            <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight lg:text-5xl">
              {sideTitle}
            </h1>
            <p className="mt-5 max-w-md text-lg leading-8 text-white/85">
              {sideText}
            </p>
          </div>

          <div className="relative rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">
              Why ReWear?
            </p>
            <div className="mt-4 space-y-3 text-sm text-white/85">
              <p>Create an account and start buying or selling today.</p>
              <p>Turn Clutter into Cash, and Deals into Discoveries.</p>
              <p>Connecting Buyers and Sellers for a Greener Future.</p>
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center p-5 sm:p-8 lg:p-12">
          <div className="w-full max-w-xl">
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">{subtitle}</p>
            <div className="mt-8 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-7">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
