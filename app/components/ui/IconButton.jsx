import React from "react";

export default function IconButton({ icon, tag = "", onClick }) {
  return (
    <button
      
  className="cursor-target icon-btn relative w-[60px] h-[60px] group overflow-visible
         transition-colors duration-300 will-change-[background-color] flex items-center justify-center"
      onClick={onClick}
    >
{/* Base Outline */}
<svg
  className="absolute inset-0 z-10 pointer-events-none"
  viewBox="0 0 71 71"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M7 25.293L0.5 18.793V0.5H54.7881L70.5 16.7021V70.5H14.2021L0.5 57.2871V46.2314L6.82324 40.8818L7 40.7314V25.293Z"
    stroke="#ffffff"
    className="fill-[#000304] group-hover:fill-[#010F15] transition-colors duration-300"
  />
</svg>

{/* Animated Outline */}
<svg
  className="cyber-outline absolute inset-0 z-20 pointer-events-none"
  viewBox="0 0 71 71"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M7 25.293L0.5 18.793V0.5H54.7881L70.5 16.7021V70.5H14.2021L0.5 57.2871V46.2314L6.82324 40.8818L7 40.7314V25.293Z"
    className="stroke-path"
    stroke="#f54b5c"
    strokeWidth="1"
    fill="none"
  />
</svg>

      {/* Hover Triangles */}
      <div className="absolute inset-0 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg className="absolute top-0 right-0" width="9" height="9" viewBox="0 0 20 20" fill="none">
          <path d="M0 0H20V20L0 0Z" stroke="#f54b5c" strokeWidth="2" fill="#f54b5c" />
        </svg>
        
      </div>

      {/* Icon */}
   <div className="relative z-40 w-full h-full flex items-center justify-center">
  <div className="w-[70%] h-[70%] max-w-[80%] max-h-[80%] object-contain text-white">
    {icon}
  </div>
</div>

      {/* Tag */}
      {tag && (
        <span
          className="absolute z-50 px-[6px] py-[2px] text-[9px] font-normal text-black bg-red-400
          left-1 bottom-[-2px] transform transition-transform duration-300 ease-in-out
          group-hover:-translate-x-[150%]"
        >
          {tag}
        </span>
      )}
    </button>
  );
}
