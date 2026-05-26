import React, { useEffect, useRef, useState } from "react";

const steps = [
  {
    id: 1,
    title: "Create Account",
    desc: "Sign up in seconds with your email or social accounts",
    icon: "👤",
  },
  {
    id: 2,
    title: "List Your Items",
    desc: "Take photos, set prices, and publish your listings instantly",
    icon: "📷",
  },
  {
    id: 3,
    title: "Make the Deal",
    desc: "Connect with buyers, negotiate, and finalize your sale",
    icon: "💰",
  },
  {
    id: 4,
    title: "Ship & Earn",
    desc: "Ship the item and receive payment securely to your account",
    icon: "🚚",
  },
];

export default function HowItWorks() {
  const [visible, setVisible] = useState([]);
  const refs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible((prev) => [...new Set([...prev, entry.target.dataset.id])]);
          }
        });
      },
      { threshold: 0.2 }
    );

    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white py-16 md:py-20 px-4 sm:px-6 text-center overflow-hidden">
      <h2 className="text-3xl font-bold mb-2">How It Works</h2>
      <p className="text-gray-500 mb-16">
        Start selling your items in just 4 simple steps
      </p>

<div className="relative flex flex-wrap justify-center gap-10 md:gap-16 max-w-7xl mx-auto">

        {/* Green Connecting Line */}
       <div className="absolute top-8 left-[10%] right-[10%] h-[3px] bg-green-600 rounded-full hidden lg:block"></div>

        {steps.map((step, i) => (
          <div
            key={step.id}
            ref={(el) => (refs.current[i] = el)}
            data-id={step.id}
           className={`w-full sm:w-[260px] transition-all duration-700 ease-out transform
              ${
                visible.includes(String(step.id))
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            {/* Icon Circle */}
            <div className="relative z-10 mx-auto w-18 h-18 flex items-center justify-center bg-green-600 text-white rounded-xl text-2xl shadow-lg mb-4">
              {step.icon}
            </div>

            {/* Step Label */}
            <div className="text-green-600 font-semibold mb-2">
              Step {step.id}
            </div>

            {/* Title */}
            <h3 className="font-bold text-lg mb-2">{step.title}</h3>

            {/* Description */}
            <p className="text-gray-500 text-sm">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}