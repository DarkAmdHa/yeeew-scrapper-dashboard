import { useContext, useEffect, useState } from "react";
import YeeewLogo from "../assets/yeew-logo.webp";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import SpinnerOverlay from "../components/SpinnerOverlay";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const { user, authLoading, token, setUser, setToken, setAuthLoading } =
    useContext(AppContext);

  const loginUser = async (user) => {
    try {
      setAuthLoading(true);
      const { data } = await axios.post("/api/auth/login", user, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setUser(data);
      setToken(data.token);

      navigate("/dashboard/");

      toast.success("Logged in successfully!");
    } catch (error) {
      console.error("Something went wrong:", error);
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : "Login failed. Please try again."
      );
    } finally {
      setAuthLoading(false);
      setErrors({});
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      // Handle form submission
      await loginUser({ email, password });
    }
  };

  useEffect(() => {
    if (user && token) {
      //Already logged in:
      navigate("/dashboard/");
    }
  }, [user, token]);

  return (
    <>
      {authLoading && <SpinnerOverlay />}
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 items-center">
        <div className="shadow-2xl rounded-2xl max-w-lg bg-gray-800 min-w-[30vw] relative overflow-hidden">
          <div
            style={{
              width: "100%",
              height: "50%",
              background: "rgb(99 102 241)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%) rotate(135deg)",
              position: "absolute",
              zIndex: "1",
            }}
          ></div>
          <div className="bg-gray-800 p-8 bg-opacity-70 z-10 relative backdrop-blur-2xl">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <img
                className="h-8 w-auto m-auto"
                src={YeeewLogo}
                alt="Yeeew! Scrapper"
              />
              <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                Sign in to your account
              </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-white"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="block w-full rounded-md border-0 bg-white/5 p-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Password
                    </label>
                    <div className="text-sm">
                      <a
                        href="#"
                        className="font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        Forgot password?
                      </a>
                    </div>
                  </div>
                  <div className="mt-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="block w-full rounded-md border-0 bg-white/5 p-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
