import React from "react";

const Aboutus = () => {
  return (
    <div className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-600">
            About ReWear
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            A simpler way to give good things a second life
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600">
            ReWear helps people buy and sell pre-loved products without the usual mess.
            We keep the flow clear: discover items, connect with real people, and make
            everyday resale feel trustworthy.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Smart for buyers</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Browse useful categories, compare listings quickly, and find quality items
              at better prices.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Easy for sellers</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              List products, manage interest, and move items you no longer use without
              complicated steps.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Better for reuse</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Every successful resale keeps usable products in circulation longer and
              cuts down unnecessary waste.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Aboutus;
