import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { useApp } from '../App';
import { AppScreen } from '../types';
import { useAuth } from '../services/AuthContext';

const GAS_URL = "https://script.google.com/macros/s/AKfycby8abM-gqYCuIWwMduASnE4wsl30AXZDyK-K2l2mds0lPf15gYsXDmb_VZvh8qjas5ERA/exec";

const VEHICLE_TYPES = ['Two-Wheeler', 'Three-Wheeler', 'Car', 'SUV', 'Bus', 'Truck'];
const PORT_TYPES = ['Type-1 (J1772)', 'Type-2 (Mennekes)', 'CCS-1', 'CCS-2', 'CHAdeMO', 'GB/T', 'Tesla'];

const ic = "w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all";

const Auth: React.FC = () => {
  const { login } = useAuth();
  const { setScreen, users } = useApp();

  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [portType, setPortType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const reset = () => {
    setStep(1); setIsVerifying(false); setIsLogin(true);
    setName(''); setEmail(''); setPassword(''); setPhone('');
    setVehicleType(''); setVehicleModel(''); setPortType('');
    setLicensePlate(''); setUserOtp('');
  };

  const handleStep1 = () => {
    if (!name.trim() || !email.trim() || !password || !phone.trim())
      return alert('Please fill all fields');
    
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email))
      return alert('Please enter a valid email address (e.g. name@example.com)');
    
    // Password Validation
    if (password.length < 8)
      return alert('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(password))
      return alert('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password))
      return alert('Password must contain at least one lowercase letter');
    if (!/\d/.test(password))
      return alert('Password must contain at least one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      return alert('Password must contain at least one special character');
      
    // Phone Validation (Basic)
    if (phone.replace(/\D/g, '').length < 10)
      return alert('Please enter a valid phone number (at least 10 digits)');

    setStep(2);
  };

  const handleSendOtp = async () => {
    if (!vehicleType || !vehicleModel.trim() || !portType || !licensePlate.trim())
      return alert('Please fill all vehicle details');
    setLoading(true);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    try {
      await emailjs.send('service_o7mvi8b', 'template_vm7dd1n',
        { to_name: name, to_email: email, otp }, 'J4ZWaktvcdEKd1xbm');
      setIsVerifying(true);
    } catch (error) {
      console.error("EmailJS Error:", error);
      alert(`Failed to send OTP via EmailJS. Check your config.\n\n[DEV MODE] Your OTP is: ${otp}`);
      setIsVerifying(true);
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (userOtp.trim() !== generatedOtp) return alert('Wrong OTP. Check your email.');
    setLoading(true);
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'registerUser', name, email, password, phone,
          vehicleType, vehicleModel, portType,
          licensePlate: licensePlate.toUpperCase(),
          registeredAt: new Date().toISOString()
        })
      });
      login({ name, email, phone, vehicleType, vehicleModel, portType, licensePlate: licensePlate.toUpperCase() });
      setScreen(AppScreen.HOME);
    } catch {
      alert('Saved locally but Google Sheet sync failed. Try again.');
    } finally { setLoading(false); }
  };

  const handleLogin = () => {
    if (!email.trim() || !password) return alert('Please fill all fields');
    const found = users?.find((u: any) =>
      u.email?.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password
    );
    if (found) {
      login({
        name: found.name || found.Name || 'User',
        email: found.email || found.Email || email,
        phone: found.phone || found.Phone || '',
        vehicleType: found.vehicletype || found.VehicleType || '',
        vehicleModel: found.vehiclemodel || found.VehicleModel || '',
        portType: found.porttype || found.PortType || '',
        licensePlate: found.licenseplate || found.LicensePlate || '',
      });
      setScreen(AppScreen.HOME);
    } else {
      alert('Invalid email or password.');
    }
  };

  return (
    <div className="flex flex-col h-full p-8 bg-white overflow-y-auto">
      {/* Logo */}
      <div className="mt-10 text-center mb-8">
        <h1 className="text-4xl font-black italic tracking-tight">VOLT<span className="text-green-500">QUEST</span></h1>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">
          {isLogin ? 'Sign in to continue' : isVerifying ? 'Verify your email' : step === 1 ? 'Step 1 — Your Details' : 'Step 2 — Your Vehicle'}
        </p>
      </div>

      {/* Progress bar for signup */}
      {!isLogin && !isVerifying && (
        <div className="flex gap-2 mb-6">
          <div className="h-1 flex-1 rounded-full bg-green-500" />
          <div className={`h-1 flex-1 rounded-full transition-all ${step === 2 ? 'bg-green-500' : 'bg-gray-100'}`} />
        </div>
      )}

      {/* ── OTP verification ── */}
      {isVerifying && (
        <div className="space-y-6 text-center flex-1 flex flex-col justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-4xl">📧</div>
          <div>
            <p className="font-black text-gray-900 text-lg">Check your inbox</p>
            <p className="text-sm text-gray-400 mt-1">6-digit code sent to</p>
            <p className="text-green-600 font-black">{email}</p>
          </div>
          <input type="text" inputMode="numeric" placeholder="000000" maxLength={6}
            className="w-full p-5 bg-gray-100 border-2 border-green-500 rounded-2xl text-center text-4xl font-black tracking-[0.4em] focus:outline-none"
            onChange={(e) => setUserOtp(e.target.value)} value={userOtp}
          />
          <button onClick={handleVerify} disabled={loading}
            className="w-full bg-green-500 text-white py-4 rounded-2xl font-black uppercase tracking-wide shadow-lg shadow-green-200 active:scale-95 transition-all disabled:opacity-50">
            {loading ? 'Creating account...' : 'Verify & Create Account'}
          </button>
          <button onClick={() => setIsVerifying(false)} className="text-xs text-gray-400 font-bold">← Back</button>
        </div>
      )}

      {/* ── Login ── */}
      {!isVerifying && isLogin && (
        <div className="space-y-4">
          <input type="email" placeholder="Email address" className={ic} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className={ic} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin}
            className="w-full bg-green-500 text-white py-4 rounded-2xl font-black uppercase tracking-wide shadow-lg shadow-green-200 active:scale-95 transition-all mt-2">
            Login
          </button>
          <button onClick={() => { reset(); setIsLogin(false); }} className="w-full text-gray-400 text-xs font-bold uppercase tracking-wide py-2">
            No account? Register here
          </button>
        </div>
      )}

      {/* ── Register Step 1 ── */}
      {!isVerifying && !isLogin && step === 1 && (
        <div className="space-y-4">
          <div>
            <input type="text" placeholder="Full name" className={ic} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <input type="email" placeholder="Email address" className={ic} value={email} onChange={(e) => setEmail(e.target.value)} />
            {email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email) && (
              <p className="text-red-400 text-[10px] pl-2 mt-1">Please enter a valid email address.</p>
            )}
          </div>
          <div>
            <input type="password" placeholder="Password (e.g. Secret@123)" className={ic} value={password} onChange={(e) => setPassword(e.target.value)} />
            {password.length > 0 && (
              <div className="text-[10px] flex flex-col gap-0.5 pl-2 mt-1.5 font-semibold tracking-wide">
                <p className={password.length >= 8 ? 'text-green-500' : 'text-gray-400'}>{password.length >= 8 ? '✓' : '○'} At least 8 characters</p>
                <p className={/[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-400'}>{/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter</p>
                <p className={/[a-z]/.test(password) ? 'text-green-500' : 'text-gray-400'}>{/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter</p>
                <p className={/\d/.test(password) ? 'text-green-500' : 'text-gray-400'}>{/\d/.test(password) ? '✓' : '○'} One number</p>
                <p className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-500' : 'text-gray-400'}>{/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'} One special character</p>
              </div>
            )}
          </div>
          <div>
            <input type="tel" placeholder="Phone number" className={ic} value={phone} onChange={(e) => setPhone(e.target.value)} />
            {phone.length > 0 && phone.replace(/\D/g, '').length < 10 && (
              <p className="text-red-400 text-[10px] pl-2 mt-1">At least 10 digits required.</p>
            )}
          </div>
          <button onClick={handleStep1}
            className="w-full bg-green-500 text-white py-4 rounded-2xl font-black uppercase tracking-wide shadow-lg shadow-green-200 active:scale-95 transition-all">
            Next: Vehicle Info →
          </button>
          <button onClick={() => setIsLogin(true)} className="w-full text-gray-400 text-xs font-bold uppercase tracking-wide py-2">
            Already have an account? Login
          </button>
        </div>
      )}

      {/* ── Register Step 2 ── */}
      {!isVerifying && !isLogin && step === 2 && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400 font-semibold text-center bg-green-50 rounded-2xl py-3 px-4">
            This helps us show you compatible chargers 🔌
          </p>
          <select className={ic} value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
            <option value="">Select vehicle type</option>
            {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" placeholder="Brand & model (e.g. Tata Nexon EV)" className={ic}
            value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} />
          <select className={ic} value={portType} onChange={(e) => setPortType(e.target.value)}>
            <option value="">Select charging port type</option>
            {PORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" placeholder="License plate (e.g. KL09AB1234)" className={ic}
            value={licensePlate} onChange={(e) => setLicensePlate(e.target.value.toUpperCase())} />
          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="w-1/3 border-2 border-gray-200 text-gray-500 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all">
              ← Back
            </button>
            <button onClick={handleSendOtp} disabled={loading}
              className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black uppercase tracking-wide shadow-lg shadow-green-200 active:scale-95 transition-all disabled:opacity-50">
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
