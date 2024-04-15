
"use client";

import { useEffect, useState } from "react"

import { createPortal } from "react-dom";

export default function Modal({
    title = "",
    content = "",
    buttons = [],
    classes = "",
    onDiscard = "",
    onConfirm = "",
    children
}) {
    let [ isOpen, setIsOpen ] = useState(false);

    useEffect(() => {
        setIsOpen(isOpen);
        if(!isOpen) {
            document.documentElement.style.overflow = "auto";
        } else {
            document.documentElement.style.overflow = "hidden";
        }
    }, [isOpen]);

    const HandleChange = () => {
        setIsOpen(!isOpen);
    }

    return (
      <>
        <div onClick={() => HandleChange()}>
            {children}
        </div>
        {isOpen && createPortal(
          <div className="z-50 w-full h-full left-0 top-0 bg-black/75 fixed flex justify-center items-center">
            <div onClick={() => HandleChange()} className="w-full h-full left-0 top-0 fixed" />
            <div className="relative z-[100] w-full sm:w-[40rem] px-4">
              <div className={`${classes ? classes : 'p-4 bg-white dark:bg-black border dark:border-white/10 rounded-lg'}`}>
                <div className="w-full flex justify-between items-center pb-4 mb-6 border-b dark:border-white/10">
                    <p className="font-medium text-lg">{title}</p>
                    <div onClick={() => HandleChange()} className="w-8 h-8 flex justify-center items-center rounded-lg transition-all duration-200 cursor-pointer hover:bg-zinc-500/20 dark:text-white/80">
                        <svg className="fill-current" width="24px" height="24px" viewBox="0 0 36 36" version="1.1" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                            <path className="clr-i-outline clr-i-outline-path-1" d="M19.41,18l8.29-8.29a1,1,0,0,0-1.41-1.41L18,16.59,9.71,8.29A1,1,0,0,0,8.29,9.71L16.59,18,8.29,26.29a1,1,0,1,0,1.41,1.41L18,19.41l8.29,8.29a1,1,0,0,0,1.41-1.41Z" />
                            <rect x={0} y={0} width={36} height={36} fillOpacity={0} />
                        </svg>
                    </div>
                </div>
                <div>{content}</div>
                <div className="mt-6 flex justify-end items-center gap-2">
                    {buttons.map((button, index) => (
                        <button 
                            onClick={() => {
                                if(button.role === "discard") {
                                    onDiscard();
                                }
                                if(button.role === "confirm") {
                                    onConfirm();
                                }
                                if(button.role === "custom") {
                                    button.onClick();
                                }
                                if(button.toClose) {
                                    setIsOpen(false);
                                }
                            }}
                            key={index} 
                            className={button.classes}
                        >
                            {button.label}
                        </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        , document.body)}
      </>
      )
}