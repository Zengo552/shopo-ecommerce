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
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${inputClasses}`}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
    const [resendMessage, setResendMessage] = useState("");

    // Function to handle the email verification
    const verifyEmail = async () => {
        if (token.trim() === "") {
            setStatusMessage({ text: "Please enter the verification token.", type: "error" });
            return;
        }

        setLoading(true);
        setStatusMessage({ text: "Verifying...", type: "info" });

        const endpoint = "http://localhost:5521/api/users/verify";

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: token }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatusMessage({ text: "Account verified successfully! Redirecting...", type: "success" });
                // Optional: redirect to login page after a delay
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                const errorMessage = data.message || "An error occurred. Please try again.";
                setStatusMessage({ text: errorMessage, type: "error" });
            }
        } catch (error) {
            console.error('Verification error:', error);
            setStatusMessage({ text: "Could not connect to the server. Please check your network connection.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Resend email button functionality
    const resendEmail = () => {
        setResendMessage("Resending...");
        // Simulate API call
        setTimeout(() => {
            setResendMessage("Email resent successfully!");
            setTimeout(() => setResendMessage(""), 3000);
        }, 2000);
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
                                        Email Verification
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
                                <p className="text-center text-gray-600 mb-6">
                                    Please enter the verification token sent to your email to activate your account.
                                </p>
                                <div className="input-area">
                                    <div className="flex sm:flex-row flex-col space-y-5 sm:space-y-0 sm:space-x-5 mb-5">
                                        <InputCom
                                            placeholder="Enter your token here"
                                            label="Verification Token*"
                                            name="token"
                                            type="text"
                                            inputClasses="h-[50px]"
                                            value={token}
                                            onChange={(e) => setToken(e.target.value)}
                                        />
                                    </div>
                                    
                                    {/* Status messages for user feedback */}
                                    {statusMessage.text && (
                                        <div className={`text-center text-sm font-medium mb-4 ${
                                            statusMessage.type === "error" ? "text-red-500" :
                                            statusMessage.type === "success" ? "text-green-500" : "text-blue-500"
                                        }`}>
                                            {statusMessage.text}
                                        </div>
                                    )}

                                    <div className="signin-area mb-3">
                                        <div className="flex justify-center">
                                            <button
                                                type="button"
                                                onClick={verifyEmail}
                                                disabled={loading}
                                                className="black-btn text-sm text-white w-full h-[50px] font-semibold flex justify-center bg-blue-600 hover:bg-blue-700 items-center rounded-md disabled:bg-gray-400"
                                            >
                                                <span>{loading ? "Verifying..." : "Verify Account"}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center space-y-4">
                                        <hr className="w-full my-6 border-gray-200" />
                                        <p className="text-gray-500 text-center">
                                            Didn't receive the email?
                                        </p>
                                        <button
                                            type="button"
                                            onClick={resendEmail}
                                            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-3 px-6 rounded-lg transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            Resend Email
                                        </button>
                                        {resendMessage && <p className="text-sm text-green-600 mt-2">{resendMessage}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
