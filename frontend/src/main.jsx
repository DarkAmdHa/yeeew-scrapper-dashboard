import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import ErrorPage from "./screens/ErrorPage.jsx";
import DashboardLayout from "./Layouts/DasboardLayout.jsx";
import BusinessPage from "./screens/BusinessPage.jsx";
import DashboardHome from "./screens/DashboardHome.jsx";

import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Prompts from "./screens/Prompts.jsx";
import LoginPage from "./screens/LoginPage.jsx";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import BulkImport from "./screens/BulkImport.jsx";
import OperationsList from "./components/OperationsList.jsx";
import OperationDetails from "./components/OperationDetails.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <ProtectedRoute component={DashboardHome} />,
      },
      {
        path: "new",
        element: <ProtectedRoute component={BusinessPage} />,
      },
      {
        path: "business/:id",
        element: <ProtectedRoute component={BusinessPage} />,
      },
      {
        path: "prompts",
        element: <ProtectedRoute component={Prompts} />,
      },
      {
        path: "bulk-import",
        element: <ProtectedRoute component={BulkImport} />,
      },

      {
        path: "operations",
        element: <ProtectedRoute component={OperationsList} />,
      },
      {
        path: "operations/:id",
        element: <ProtectedRoute component={OperationDetails} />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
    </AppProvider>
  </React.StrictMode>
);
