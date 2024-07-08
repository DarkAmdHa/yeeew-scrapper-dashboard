// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { Route, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useEffect } from "react";
import SpinnerOverlay from "./SpinnerOverlay";
import RunningOperation from "./RunningOperation";

function ProtectedRoute({ component: Component, ...rest }) {
  const { token, authLoading } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token && !authLoading) navigate("/login/");
  }, [token, authLoading, navigate]);

  if (authLoading) return <SpinnerOverlay />;
  // return !authLoading && token && <Component />;
  return (
    <>
      <Component /> {token && <RunningOperation />}
    </>
  );
}

export default ProtectedRoute;
