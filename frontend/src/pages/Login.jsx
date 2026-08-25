import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import Logo from "@/components/Logo.jsx";
import Button from "@/components/Button.jsx";
import loginImg from '../assets/images/login_img.webp';
import { FiHelpCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { authApi, saveAuth, routeForRole, isTwoFactorError } from '@/lib/api';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // Second step: the account has 2FA on, so the password alone is rejected
    // until we also send the code from the authenticator app.
    const [needsTotp, setNeedsTotp] = useState(false);
    const [totpToken, setTotpToken] = useState('');
    const totpRef = useRef(null);

    useEffect(() => {
        if (needsTotp) totpRef.current?.focus();
    }, [needsTotp]);

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await authApi.login({
                email: email.trim(),
                password,
                rememberMe,
                totpToken: needsTotp ? totpToken.trim() : undefined,
            });
            saveAuth(data);
            // Send each role to its own area of the app.
            navigate(routeForRole(data.user?.role));
        } catch (err) {
            // "2FA token required" is not a dead end — reveal the code field and
            // let the same credentials go back up with the token attached.
            if (needsTotp) {
                // Already on the code step. Stay here whatever the message says:
                // the password was accepted to get this far, so bouncing back to
                // it would lose that and explain nothing. The server can also
                // fail here for reasons that are not about the code the user
                // typed — a malformed stored secret comes back as
                // "Invalid Base32 string…" — and those need to stay readable.
                setTotpToken('');
                setError(err.message);
            } else if (isTwoFactorError(err.message)) {
                setNeedsTotp(true);
                setTotpToken('');
                setError(
                    'This account is protected by two-factor authentication. Enter the 6-digit code from your authenticator app.',
                );
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const backToPassword = () => {
        setNeedsTotp(false);
        setTotpToken('');
        setError('');
    };

    return (
        <section className="min-h-screen lg:max-h-screen lg:p-5 w-full flex flex-col lg:flex-row lg:gap-3 lg:overflow-hidden max-w-375 mx-auto bg-[#f8f9fa] lg:bg-transparent">
            {/* Image Container (Top on Mobile, Right on Desktop) */}
            <div className="w-full h-[45vh] lg:h-auto lg:w-1/2 lg:order-2 relative flex items-center justify-center bg-[#0e1320] overflow-hidden lg:rounded-2xl lg:shadow-sm lg:border-black/5 lg:border">
                {/* Mobile Header overlay over image */}
                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 text-white lg:hidden">
                    <Logo />
                    <a className="text-white/80 cursor-pointer pr-2 text-sm">Need any help?</a>
                </div>

                <img
                    src={loginImg}
                    width={1080}
                    height={1920}
                    fetchPriority="high"
                    decoding="async"
                    loading="eager"
                    className="w-full h-full object-cover lg:scale-110 lg:rounded-2xl"
                    alt="Lord Krishna"
                />

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
                    
                    {error && <p className={`text-sm mt-2 font-medium ${needsTotp ? 'text-amber-600' : 'text-red-500'}`} role="alert">{error}</p>}

                    <form onSubmit={handleLogin}>
                    {needsTotp ? (
                        /* ---- Step 2: authenticator code ---- */
                        <>
                            <div className="my-4 lg:my-5 flex flex-col gap-2">
                                <label className="text-sm lg:text-base font-medium" htmlFor="totp">Authentication Code *</label>
                                <input
                                    id="totp"
                                    ref={totpRef}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={totpToken}
                                    onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ''))}
                                    className="border-black/10 border-[1px] p-3 lg:p-2 rounded-lg shadow-sm w-full outline-none focus:border-black/30 transition-all text-lg tracking-[0.5em] text-center font-mono"
                                    placeholder="000000"
                                />
                                <p className="text-xs text-black/50">
                                    Signing in as <span className="font-medium text-black/70">{email.trim()}</span>
                                </p>
                            </div>

                            <div className="my-6 lg:my-5">
                                <Button
                                    text="Verify & Login"
                                    width="100%"
                                    type="submit"
                                    loading={loading}
                                    disabled={totpToken.length !== 6}
                                    handler={handleLogin}
                                />
                            </div>

                            <div className="flex justify-center">
                                <button type="button" onClick={backToPassword} className="text-sm font-medium text-black/60 hover:text-black hover:underline">
                                    Use a different account
                                </button>
                            </div>
                        </>
                    ) : (
                        /* ---- Step 1: email + password ---- */
                        <>
                    <div className="my-4 lg:my-5 flex flex-col gap-2">
                        <label className="text-sm lg:text-base font-medium" htmlFor="email">Email *</label>
                        <div className="relative flex items-center">
                            <input
                                id="email"
                                type="text"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border-black/10 border-[1px] p-3 lg:p-2 pr-10 lg:pr-10 rounded-lg shadow-sm w-full outline-none focus:border-black/30 transition-all text-sm lg:text-base"
                                placeholder="atharv@ramdootfoundation.com"
                            />
                            <FiHelpCircle className="absolute right-3 text-black/40 text-lg cursor-pointer" />
                        </div>
                    </div>

                    <div className="my-4 lg:my-5 flex flex-col gap-2">
                        <label className="text-sm lg:text-base font-medium" htmlFor="password">Password *</label>
                        <div className="relative flex items-center">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border-black/10 border-[1px] p-3 lg:p-2 pr-10 lg:pr-10 rounded-lg shadow-sm w-full outline-none focus:border-black/30 transition-all text-sm lg:text-base"
                                placeholder="*********"
                            />
                            {/* The eye used to be decorative — it looked interactive and did nothing. */}
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                className="absolute right-3 text-black/40 hover:text-black/70 text-lg cursor-pointer"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-6 lg:mb-0">
                        <div className="flex gap-2 items-center">
                            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="cursor-pointer w-4 h-4 rounded border-gray-300" name="remember" id="remember" />
                            <label className="font-medium text-black/70 text-xs lg:text-sm cursor-pointer" htmlFor="remember" >Remember for 30 days</label>
                        </div>
                        <Link to="/forgot-password" className="font-bold lg:font-medium text-xs lg:text-sm cursor-pointer hover:underline text-black">Forgot password</Link>
                    </div>

                    <div className="my-6 lg:my-5">
                        <Button text={loading ? "Logging in..." : "Login"} width="100%" type="submit" handler={handleLogin} />
                    </div>

                    <div className="flex justify-center gap-2 items-center">
                        <p className="font-light tracking-wide text-black/60 lg:text-highlight/80 text-sm">Don't have an account?</p>
                        <Link to="/signup" className="font-bold lg:font-medium cursor-pointer hover:underline text-black lg:text-black">Sign up</Link>
                    </div>
                        </>
                    )}
                    </form>
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
