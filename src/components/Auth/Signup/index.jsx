import { useState, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";

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
  return <div className="w-[300px] h-[400px] bg-gray-200 rounded-md shadow-lg flex justify-center items-center text-gray-500">
    <p>Thumbnail Image</p>
  </div>;
};

export default function Signup() {
  const [checked, setValue] = useState(false);
  const navigate = useNavigate(); // Initialize the navigate hook
  
  // State for form inputs
  const [firstName, setFirstName] = useState("Revol");
  const [surname, setSurname] = useState("Doe");
  const [email, setEmail] = useState("revoltenby552@gmail.com");
  const [password, setPassword] = useState("@Revol552");
  const [confirmPassword, setConfirmPassword] = useState("@Revol552");

  // State for API call status and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const rememberMe = () => {
    setValue(!checked);
  };
  
  const handleSignup = async () => {
    setLoading(true);
    setError(null);

    // Validate if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Backend endpoint on port 8080. Update the path if needed.
    const signupEndpoint = "http://localhost:8080/api/users/register";

    try {
      const response = await fetch(signupEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          surname,
          email,
          password,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed. Please try again.");
      }

      const data = await response.json();
      console.log("Signup successful:", data);
      
      // Navigate to the email verification page after a successful signup.
      navigate("/verify-email");

    } catch (err) {
      // Improved error handling for network-related issues
      if (err instanceof TypeError) {
        setError("Could not connect to the server. Please make sure the server is running on port 8080.");
      } else {
        setError(err.message);
      }
      console.error("Signup error:", err);
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
                    Create Account
                  </h1>
                  <div className="shape -mt-6">
                    <svg
                      width="354"
                      height="30"
                      viewBox="0 0 354 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 28.8027C17.6508 20.3626 63.9476 8.17089 113.509 17.8802C166.729 28.3062 341.329 42.704 353 1"
                        stroke="#FFBB38"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="input-area">
                  <div className="flex sm:flex-row flex-col space-y-5 sm:space-y-0 sm:space-x-5 mb-5">
                    <InputCom
                      placeholder="Demo Name"
                      label="First Name*"
                      name="fname"
                      type="text"
                      inputClasses="h-[50px]"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />

                    <InputCom
                      placeholder="Demo Name"
                      label="Surname*"
                      name="lname"
                      type="text"
                      inputClasses="h-[50px]"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col space-y-5 sm:space-y-0 sm:space-x-5 mb-5">
                    <InputCom
                      placeholder="Demo@gmail.com"
                      label="Email Address*"
                      name="email"
                      type="email"
                      inputClasses="h-[50px]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <InputCom
                      placeholder="● ● ● ● ● ●"
                      label="Password*"
                      name="password"
                      type="password"
                      inputClasses="h-[50px]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex sm:flex-row flex-col space-y-5 sm:space-y-0 sm:space-x-5 mb-5">
                    <InputCom
                      placeholder="● ● ● ● ● ●"
                      label="Confirm Password*"
                      name="confirmPassword"
                      type="password"
                      inputClasses="h-[50px]"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  {/* Status messages for user feedback */}
                  {loading && <p className="text-center text-blue-500 mb-4">Creating account...</p>}
                  {error && <p className="text-center text-red-500 mb-4">{error}</p>}

                  <div className="forgot-password-area mb-7">
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
                        className="text-base text-black"
                      >
                        I agree to all
                        <span className="text-qblack"> terms and conditions</span>
                        in BigShop.
                      </span>
                    </div>
                  </div>
                  <div className="signin-area mb-3">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={handleSignup}
                        disabled={loading}
                        className="black-btn text-sm text-white w-full h-[50px] font-semibold flex justify-center bg-purple items-center rounded-md disabled:bg-gray-400"
                      >
                        <span>Create Account</span>
                      </button>
                    </div>
                  </div>

                  <div className="signup-area flex justify-center">
                    <p className="text-base text-qgraytwo font-normal">
                      Already have an Account?
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
