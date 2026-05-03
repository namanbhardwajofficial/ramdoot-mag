import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Logo from "@/components/Logo.jsx";
import Button from "@/components/Button.jsx";
import loginImg from '../assets/images/login_img.png';
import { FiHelpCircle, FiEye } from "react-icons/fi";
import { BACKEND_URL } from '@/config/constants';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/admin'); // Redirect to dashboard
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen lg:max-h-screen lg:p-5 w-full flex flex-col lg:flex-row lg:gap-3 overflow-hidden max-w-375 mx-auto bg-[#f8f9fa] lg:bg-transparent">
            {/* Image Container (Top on Mobile, Right on Desktop) */}
            <div className="w-full h-[45vh] lg:h-auto lg:w-1/2 lg:order-2 relative flex items-center justify-center bg-white overflow-hidden lg:rounded-2xl lg:shadow-sm lg:border-black/5 lg:border">
                {/* Mobile Header overlay over image */}
                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 text-white lg:hidden">
                    <Logo />
                    <a className="text-white/80 cursor-pointer pr-2 text-sm">Need any help?</a>
                </div>

                <img src={loginImg} className="w-full h-full object-cover lg:scale-110 lg:rounded-2xl" alt="Lord Krishna image" />

                {/* Desktop overlay text over image */}
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

            {/* Form Container (Bottom card on Mobile, Left on Desktop) */}
            <div className="w-full lg:w-1/2 lg:order-1 bg-white rounded-t-3xl -mt-6 lg:mt-0 relative z-10 lg:rounded-2xl flex flex-col justify-between p-6 lg:p-0 lg:shadow-sm lg:border-black/5 lg:border-[0.5px]">
                {/* Desktop Header */}
                <div className="hidden lg:flex justify-between items-center p-3">
                    <Logo />
                    <a className="underline text-highlight cursor-pointer">Need Help?</a>
                </div>

                <div className="w-full sm:w-[80%] lg:w-[55%] mx-auto mt-2 lg:mt-0 flex-grow flex flex-col justify-center">
                    <h1 className="font-medium text-2xl lg:text-3xl py-2" >
                        Your Main Go to Channel For Learning Real Hindu History.
                    </h1>
                    <p className="py-1 font-regular text-black/50 text-sm lg:text-base">
                        Login & access your account to read more about history.
                    </p>
                    
                    {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}

                    <div className="my-4 lg:my-5 flex flex-col gap-2">
                        <label className="text-sm lg:text-base font-medium">Email *</label>
                        <div className="relative flex items-center">
                            <input 
                                type="text" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border-black/10 border-[1px] p-3 lg:p-2 pr-10 lg:pr-10 rounded-lg shadow-sm w-full outline-none focus:border-black/30 transition-all text-sm lg:text-base" 
                                placeholder="atharv@ramdootfoundation.com" 
                            />
                            <FiHelpCircle className="absolute right-3 text-black/40 text-lg cursor-pointer" />
                        </div>
                    </div>
                    
                    <div className="my-4 lg:my-5 flex flex-col gap-2">
                        <label className="text-sm lg:text-base font-medium">Password *</label>
                        <div className="relative flex items-center">
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border-black/10 border-[1px] p-3 lg:p-2 pr-10 lg:pr-10 rounded-lg shadow-sm w-full outline-none focus:border-black/30 transition-all text-sm lg:text-base" 
                                placeholder="*********" 
                            />
                            <FiEye className="absolute right-3 text-black/40 text-lg cursor-pointer" />
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-6 lg:mb-0">
                        <div className="flex gap-2 items-center">
                            <input type="checkbox" className="cursor-pointer w-4 h-4 rounded border-gray-300" name="remember" id="remember" />
                            <label className="font-medium text-black/70 text-xs lg:text-sm cursor-pointer" htmlFor="remember" >Remember for 30 days</label>
                        </div>
                        <p className="font-bold lg:font-medium text-xs lg:text-sm cursor-pointer hover:underline text-black">Forgot password</p>
                    </div>
                    
                    <div className="my-6 lg:my-5">
                        <Button text={loading ? "Logging in..." : "Login"} width="100%" handler={handleLogin} />
                    </div>
                    
                    <div className="flex justify-center gap-2 items-center">
                        <p className="font-light tracking-wide text-black/60 lg:text-highlight/80 text-sm">Don't have an account?</p>
                        <Link to="/signup" className="font-bold lg:font-medium cursor-pointer hover:underline text-black lg:text-black">Sign up</Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-4 lg:mt-0 lg:p-5 pb-2">
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

export default Login;
