import React from 'react';
import Logo from "../components/Logo.jsx";
import Button from "../components/Button.jsx";
import loginImg from '../assets/images/login_img.png';

const Login = () => {
    return (
        <section className="max-h-screen p-5 w-full flex gap-3 overflow-hidden max-w-375 mx-auto ">

            <div className="shadow-sm border-black/5 border-[0.5px] w-1/2 rounded-2xl flex flex-col justify-between">

                <div className="flex justify-between items-center p-3">
                    <Logo />
                    <a className="underline text-highlight cursor-pointer">Need Help?</a>
                </div>

                <div className="w-[55%] mx-auto">
                    <h1 className="font-medium text-3xl py-2" >
                        Your Main Go to Channel For Learning Real Hindu History.
                    </h1>
                    <p className="py-1 font-regular text-black/40">
                        Login & access your account to read more about history.
                    </p>
                    <div className="my-5 flex flex-col gap-2">
                        <label>Email*</label>
                        <input type="text" className="border-black/10 border-[0.1px] p-2 rounded-lg shadow-sm" placeholder="Enter email here.." />
                    </div>
                    <div className="my-5 flex flex-col gap-2">
                        <label>Password*</label>
                        <input type="text" className="border-black/10 border-[0.1px] p-2 rounded-lg shadow-sm" placeholder="Enter email here.." />
                    </div>
                    <div className="flex justify-between">
                        <div className="flex gap-2 items-center">
                            <input type="checkbox" className="cursor-pointer" name="remember" id="remember" />
                            <label className="font-medium text-black/70 text-sm" htmlFor="remember" >Remember for 30 days</label>
                        </div>
                        <p className="font-medium text-md cursor-pointer">Forget Password</p>
                    </div>
                    <div className="my-5">
                        <Button text="Login" width="100%" />
                    </div>
                    <div className="flex justify-center gap-2 items-center">
                        <p className="font-light tracking-wide text-highlight/80 text-sm">Don't have an account?</p>
                        <p className="font-medium cursor-pointer">Sign up</p>
                    </div>
                </div>

                <div className="flex justify-between items-center p-5">
                    <p className='text-highlight/50 text-sm'>All Rights Reserved</p>
                    <span className="flex gap-2 items-center underline text-highlight/40 text-sm">
                        <a className="cursor-pointer">T&C</a>
                        <a className="cursor-pointer">Privacy Policy</a>
                    </span>
                </div>

            </div>

            <div className="shadow-sm border-black/5 border w-1/2 rounded-2xl relative flex items-center justify-center bg-white overflow-hidden">

                <img src={loginImg} className="w-full h-full object-cover rounded-2xl scale-110"  alt="Lord Krishna image"/>

                <div className="absolute bottom-0 text-white backdrop-blur-xs pt-5 pb-15 flex flex-col gap-3">
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

        </section>
    );
};

export default Login;
