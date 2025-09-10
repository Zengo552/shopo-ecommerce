import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Placeholder components to make the file self-contained and runnable.
const Layout = ({ childrenClasses, children }) => {
  return <div className={`w-full ${childrenClasses}`}>{children}</div>;
};

const InputCom = ({ placeholder, label, name, type, inputClasses, onChange, value }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${inputClasses}`}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

const Thumbnail = () => {
  return (
    <div className="w-[300px] h-[400px] bg-gray-200 rounded-md shadow-lg flex justify-center items-center text-gray-500">
      <p>Thumbnail Image</p>
    </div>
  );
};

export default function ResetPassword() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError(null);

    // Validate if passwords match
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password must match.");
      setLoading(false);
      return;
    }

    const resetPasswordEndpoint = "http://localhost:8080/api/users/reset";

    try {
      const response = await fetch(resetPasswordEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong. Please try again.");
      }

      setMessage("Password has been reset successfully. You can now log in with your new password.");
      
      // Navigate to the login page after a successful reset
      navigate('/login');

    } catch (err) {
      if (err instanceof TypeError) {
        setError("Could not connect to the server. Please make sure the server is running on port 8080.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="login-page-wrapper w-full py-10">
        <div className="container-x mx-auto">
          <div className="lg:flex items-center relative">
            <div className="lg:w-[572px] w-full lg:h-[783px] bg-white flex flex-col justify-center sm:p-10 p-5 border border-[#E0E0E0]">
              <div className="w-full">
                <div className="title-area flex flex-col justify-center items-center relative text-center mb-7">
                  <h1 className="text-[34px] font-bold leading-[74px] text-qblack">
                    Reset Password
                  </h1>
                  <svg width="250" height="20" viewBox="0 0 250 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 15C36.8333 3.66667 80.8 -3.2 125 4C176 13 219.5 22.5 245 14" stroke="#FFB800" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="input-area">
                  <form onSubmit={handleResetPassword}>
                    <div className="input-area mb-5">
                      <InputCom
                        placeholder="Enter token"
                        label="Token*"
                        name="token"
                        type="text"
                        inputClasses="h-[50px]"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                      />
                    </div>
                    <div className="input-area mb-5">
                      <InputCom
                        placeholder="Enter new password"
                        label="New Password*"
                        name="newPassword"
                        type="password"
                        inputClasses="h-[50px]"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="input-area mb-5">
                      <InputCom
                        placeholder="Confirm new password"
                        label="Confirm Password*"
                        name="confirmPassword"
                        type="password"
                        inputClasses="h-[50px]"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    
                    {loading && <p className="text-center text-blue-500 mb-4">Resetting password...</p>}
                    {message && <p className="text-center text-green-500 mb-4">{message}</p>}
                    {error && <p className="text-center text-red-500 mb-4">{error}</p>}

                    <div className="signin-area mb-3">
                      <div className="flex justify-center">
                        <button
                          type="submit"
                          disabled={loading}
                          className="black-btn text-sm text-white w-full h-[50px] font-semibold flex justify-center bg-purple items-center rounded-md disabled:bg-gray-400"
                        >
                          <span>Reset Password</span>
                        </button>
                      </div>
                    </div>
                  </form>
                  <div className="signup-area flex justify-center">
                    <p className="text-base text-qgraytwo font-normal">
                      Remember your password?
                      <Link to="/login" className="ml-2 text-qblack">
                        Log In
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 lg:flex hidden transform scale-60 xl:scale-100 xl:justify-center">
              <div
                className="absolute xl:-right-20 -right-[138px]"
                style={{ top: "calc(50% - 258px)" }}
              >
                <Thumbnail />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
