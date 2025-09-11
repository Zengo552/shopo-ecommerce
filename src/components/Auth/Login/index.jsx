import { useState, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";

// Placeholder components
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
  return <div className="w-[300px] h-[400px] bg-gray-200 rounded-md shadow-lg flex justify-center items-center text-gray-500">
    <p>Thumbnail Image</p>
  </div>;
};

export default function Login() {
  const [checked, setValue] = useState(false);
  const navigate = useNavigate();

  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // State for API call status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const rememberMe = () => {
    setValue(!checked);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Login endpoint - update with your actual backend URL
    const loginEndpoint = "http://localhost:8080/api/users/login";

    try {
      const response = await fetch(loginEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }

      console.log("Login successful:", data);
      
      // Extract and store the JWT token from the response
      // Based on your screenshot, the token is in data.jwt
      if (data.jwt) {
        localStorage.setItem('authToken', data.jwt);
        console.log("JWT token stored successfully");
      } else {
        console.warn("No JWT token found in response");
      }
      
      // Store user data if available
      if (data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user));
      }
      
      // Update global authentication state
      window.dispatchEvent(new Event('authChange'));
      
      // Navigate to the home page after a successful login
      navigate("/");

    } catch (err) {
      // Improved error handling
      if (err instanceof TypeError) {
        setError("Could not connect to the server. Please make sure the server is running and the URL is correct.");
      } else {
        setError(err.message);
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="login-page-wrapper w-full py-10">
        <div className="container-x mx-auto">
          <div className="lg:flex items-center relative">
            <div className="lg:w-[572px] w-full h-[783px] bg-white flex flex-col justify-center sm:p-10 p-5 border border-[#E0E0E0]">
              <div className="w-full">
                <form onSubmit={handleLogin}>
                  <div className="title-area flex flex-col justify-center items-center relative text-center mb-7">
                    <h1 className="text-[34px] font-bold leading-[74px] text-qblack">
                      Log In
                    </h1>
                    <div className="shape -mt-6">
                      <svg
                        width="172"
                        height="29"
                        viewBox="0 0 172 29"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 5.08742C17.6667 19.0972 30.5 31.1305 62.5 27.2693C110.617 21.4634 150 -10.09 171 5.08727"
                          stroke="#FFBB38"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="input-area">
                    <div className="input-item mb-5">
                      <InputCom
                        placeholder="example@quomodosoft.com"
                        label="Email Address*"
                        name="email"
                        type="email"
                        inputClasses="h-[50px]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="input-item mb-5">
                      <InputCom
                        placeholder="● ● ● ● ● ●"
                        label="Password*"
                        name="password"
                        type="password"
                        inputClasses="h-[50px]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="forgot-password-area flex justify-between items-center mb-7">
                      <div className="remember-checkbox flex items-center space-x-2.5">
                        <button
                          onClick={rememberMe}
                          type="button"
                          className="w-5 h-5 text-qblack flex justify-center items-center border border-light-gray"
                        >
                          {checked && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                        <span
                          onClick={rememberMe}
                          className="text-base text-black cursor-pointer"
                        >
                          Remember Me
                        </span>
                      </div>
                      <Link
                        to="/forgot-password"
                        className="text-base text-qyellow"
                      >
                        Forgot Password
                      </Link>
                    </div>
                    {/* Status messages for user feedback */}
                    {loading && <p className="text-center text-blue-500 mb-4">Logging in...</p>}
                    {error && <p className="text-center text-red-500 mb-4">{error}</p>}
                    
                    <div className="signin-area mb-3.5">
                      <div className="flex justify-center">
                        <button
                          type="submit"
                          disabled={loading}
                          className="black-btn mb-6 text-sm text-white w-full h-[50px] font-semibold flex justify-center bg-purple-600 items-center rounded-md disabled:bg-gray-400"
                        >
                          <span>{loading ? "Logging in..." : "Log In"}</span>
                        </button>
                      </div>
                      <a
                        href="#"
                        className="w-full border border-qgray-border h-[50px] flex space-x-3 justify-center bg-[#FAFAFA] items-center rounded-md"
                      >
                        <svg
                          width="19"
                          height="20"
                          viewBox="0 0 19 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* Google icon paths */}
                        </svg>
                        <span className="text-[18px] text-qgraytwo font-normal">
                          Sign In with Google
                        </span>
                      </a>
                    </div>
                    <div className="signup-area flex justify-center">
                      <p className="text-base text-qgraytwo font-normal">
                        Don't have an account ?
                        <Link to="/signup" className="ml-2 text-qblack">
                          Sign up free
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
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