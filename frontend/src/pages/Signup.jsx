import React, { useState, useRef } from 'react';
import Logo from "@/components/Logo.jsx";
import Button from "@/components/Button.jsx";
import loginImg from '../assets/images/login_img.png';
import { FiHelpCircle, FiEye, FiRefreshCw, FiChevronDown, FiChevronLeft } from "react-icons/fi";
import { Link } from 'react-router';

const Signup = () => {
    const [step, setStep] = useState(1);
    const otpRefs = useRef([]);
    const [formData, setFormData] = useState({
        fullName: '',
        countryCode: 'IN',
        phoneNo: '',
        email: '',
        password: '',
        confirmPassword: '',
        otp: ['', '', '', '', '', '']
    });

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1); // Take only the last character if multiple characters are pasted/entered
        if (value && !/^\d$/.test(value)) return; // Only allow digits

        const newOtp = [...formData.otp];
        newOtp[index] = value;
        setFormData({ ...formData, otp: newOtp });

        // Move to next input if value is entered
        if (value !== '' && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        // Move to previous input on backspace if current is empty
        if (e.key === 'Backspace' && formData.otp[index] === '' && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    return (
        <section className="min-h-screen lg:max-h-screen lg:p-5 w-full flex flex-col lg:flex-row lg:gap-3 overflow-hidden max-w-[1440px] mx-auto bg-[#f8f9fa] lg:bg-transparent">
            {/* Image Container */}
            <div className="w-full h-[45vh] lg:h-auto lg:w-1/2 lg:order-2 relative flex items-center justify-center bg-white overflow-hidden lg:rounded-2xl lg:shadow-sm lg:border-black/5 lg:border">
                {/* Mobile Header */}
                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 text-white lg:hidden">
                    <Logo />
                    <a className="text-white/80 cursor-pointer pr-2 text-sm hover:underline">Need any help?</a>
                </div>

                <img src={loginImg} className="w-full h-full object-cover lg:scale-110 lg:rounded-2xl" alt="Lord Krishna image" />

                {/* Desktop overlay */}
                <div className="hidden lg:flex absolute bottom-0 text-white backdrop-blur-xs pt-5 pb-15 flex-col gap-3">
                    <h1 className="text-3xl font-light w-4/5 mx-auto">
                        Magazines which focus on real history not pirated one.
                    </h1>
                    <p className="text-sm font-extralight tracking-widest text-white/50 w-4/5 mx-auto">
                        Ever feel you wanted to learn real history about your culture, society & country you live in? We got you covered, SUBSCRIBE NOW.
                    </p>
                    <div className="flex w-4/5 gap-1 mx-auto">
                        <span className="w-8 h-1 block rounded-full bg-white/90"></span>
                        <span className="w-8 h-1 block rounded-full bg-white/30"></span>
                        <span className="w-8 h-1 block rounded-full bg-white/30"></span>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <div className="w-full lg:w-1/2 lg:order-1 bg-white rounded-t-3xl -mt-6 lg:mt-0 relative z-10 lg:rounded-2xl flex flex-col justify-between p-6 lg:p-0 lg:shadow-sm lg:border-black/5 lg:border-[0.5px] overflow-y-auto">
                {/* Desktop Header */}
                <div className="hidden lg:flex justify-between items-center p-3">
                    <Logo />
                    <a className="underline text-highlight cursor-pointer hover:text-black">Need Help?</a>
                </div>

                <div className="w-full sm:w-[80%] lg:w-[55%] mx-auto mt-2 lg:mt-0 flex-grow flex flex-col justify-center">
                    <h1 className="font-medium text-2xl lg:text-3xl py-2">
                        Create a Account
                    </h1>
                    <p className="py-1 font-regular text-black/50 text-sm lg:text-base">
                        Fill all the detail information to create a account
                    </p>

                    {/* Progress Bar */}
                    <div className="flex gap-2 my-4">
                        <span className={`w-8 h-1 block rounded-full transition-colors ${step >= 1 ? 'bg-[#3d3d3d]' : 'bg-[#e5e5e5]'}`}></span>
                        <span className={`w-8 h-1 block rounded-full transition-colors ${step >= 2 ? 'bg-[#3d3d3d]' : 'bg-[#e5e5e5]'}`}></span>
                        <span className={`w-8 h-1 block rounded-full transition-colors ${step >= 3 ? 'bg-[#3d3d3d]' : 'bg-[#e5e5e5]'}`}></span>
                    </div>

                    {/* Step 1 */}
                    {step === 1 && (
                        <div className="flex flex-col gap-4 lg:gap-5 mt-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm lg:text-base font-medium">Full Name *</label>
                                <input type="text" className="border-black/10 border-[1px] p-3 lg:p-2 rounded-lg shadow-sm w-full outline-none focus:border-black/30 transition-all text-sm lg:text-base" placeholder="Atharv Kelwadkar" />
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label className="text-sm lg:text-base font-medium">Phone No *</label>
                                <div className="flex border-black/10 border-[1px] rounded-lg shadow-sm w-full overflow-hidden focus-within:border-black/30 transition-all bg-white">
                                    <div className="flex items-center gap-1 bg-[#f9fafb] px-3 border-r border-black/10 cursor-pointer hover:bg-gray-100 transition-colors">
                                        <span className="text-sm lg:text-base text-black/70 font-medium">IN</span>
                                        <FiChevronDown className="text-black/50" />
                                    </div>
                                    <input type="text" className="p-3 lg:p-2 w-full outline-none text-sm lg:text-base" placeholder="9136840260" />
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label className="text-sm lg:text-base font-medium">Email *</label>
                                <div className="relative flex items-center">
                                    <input type="email" className="border-black/10 border-[1px] p-3 lg:p-2 pr-10 rounded-lg shadow-sm w-full outline-none focus:border-black/30 transition-all text-sm lg:text-base" placeholder="atharv@ramdootfoundation.com" />
                                    <FiHelpCircle className="absolute right-3 text-black/40 text-lg cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <div className="flex flex-col gap-4 lg:gap-5 mt-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm lg:text-base font-medium">Password *</label>
                                <div className="relative flex items-center">
                                    <input type="password" className="border-black/10 border-[1px] p-3 lg:p-2 pr-10 rounded-lg shadow-sm w-full outline-none focus:border-black/30 transition-all text-sm lg:text-base" placeholder="*********" />
                                    <FiEye className="absolute right-3 text-black/40 text-lg cursor-pointer" />
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label className="text-sm lg:text-base font-medium">Confirm Password *</label>
                                <div className="relative flex items-center">
                                    <input type="password" className="border-black/10 border-[1px] p-3 lg:p-2 pr-10 rounded-lg shadow-sm w-full outline-none focus:border-black/30 transition-all text-sm lg:text-base" placeholder="*********" />
                                    <FiEye className="absolute right-3 text-black/40 text-lg cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                        <div className="flex flex-col gap-4 lg:gap-5 mt-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm lg:text-base font-medium">Verify Email *</label>
                                <div className="flex items-center justify-between lg:justify-start gap-1 lg:gap-3 w-full">
                                    {[0, 1, 2].map((idx) => (
                                        <input 
                                            key={idx} 
                                            ref={(el) => (otpRefs.current[idx] = el)}
                                            type="text" 
                                            maxLength={1} 
                                            value={formData.otp[idx]} 
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                            className="w-10 h-10 lg:w-12 lg:h-12 border-black/10 border-[1px] rounded-lg shadow-sm text-center text-lg outline-none focus:border-black/30 transition-all font-medium" 
                                            placeholder="0" 
                                        />
                                    ))}
                                    <span className="text-black/30 font-bold mx-1">-</span>
                                    {[3, 4, 5].map((idx) => (
                                        <input 
                                            key={idx} 
                                            ref={(el) => (otpRefs.current[idx] = el)}
                                            type="text" 
                                            maxLength={1} 
                                            value={formData.otp[idx]} 
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                            className="w-10 h-10 lg:w-12 lg:h-12 border-black/10 border-[1px] rounded-lg shadow-sm text-center text-lg outline-none focus:border-black/30 transition-all font-medium" 
                                            placeholder="0" 
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1 cursor-pointer w-fit group">
                                <FiRefreshCw className="text-black/60 text-sm group-hover:text-black transition-colors" />
                                <span className="text-xs lg:text-sm text-black/60 font-medium group-hover:text-black transition-colors">Resend Verification Code</span>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 mb-4">
                        <Button text={step === 3 ? "Create Account" : "Next"} width="100%" handler={step === 3 ? () => console.log('Submit', formData) : handleNext} />
                    </div>

                    {step > 1 && (
                        <div className="flex justify-center items-center mb-4 cursor-pointer text-black/50 hover:text-black transition-colors w-fit mx-auto group" onClick={handleBack}>
                            <FiChevronLeft className="mr-1 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">Go Back</span>
                        </div>
                    )}
                    
                    <div className="flex justify-center gap-2 items-center mt-2">
                        <p className="font-light tracking-wide text-black/60 lg:text-highlight/80 text-sm">Already have an account?</p>
                        <Link to="/login" className="font-bold lg:font-medium cursor-pointer hover:underline text-black lg:text-black">Login</Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-8 lg:mt-0 lg:p-5 pb-2">
                    <p className='text-black/40 lg:text-highlight/50 text-xs lg:text-sm'>All Right Reserved</p>
                    <span className="flex gap-3 lg:gap-2 items-center underline text-black/40 lg:text-highlight/40 text-xs lg:text-sm">
                        <a className="cursor-pointer hover:text-black/60">T&C</a>
                        <a className="cursor-pointer hover:text-black/60">Private Policy</a>
                    </span>
                </div>
            </div>
        </section>
    );
};

export default Signup;
