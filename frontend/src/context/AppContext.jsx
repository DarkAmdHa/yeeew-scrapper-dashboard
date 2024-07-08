// src/context/AppContext.jsx
import { createContext, useEffect, useReducer } from "react";
import AppReducer from "./AppReducer";
import { getUser } from "../utils/getUser";
import { toast } from "react-toastify";

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem("jwt") || null,
  authLoading: true,
};

// Create context
export const AppContext = createContext(initialState);

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        dispatch({ type: "AUTH_LOADING", payload: true });

        const userData = await getUser(state.token);

        if (userData) {
          dispatch({ type: "SET_USER", payload: userData });
        } else {
          dispatch({ type: "SET_TOKEN", payload: null });
          localStorage.removeItem("jwt");
        }
      } catch (error) {
        console.error("Error fetching user:", error);

        //If token is expired, remove it:
        if (error.response?.status === 401) {
          dispatch({ type: "SET_USER", payload: null });
          dispatch({ type: "SET_TOKEN", payload: null });
        } else {
          toast.error("Error fetching user data");
        }
      } finally {
        dispatch({ type: "AUTH_LOADING", payload: false });
      }
    };
    if (state.token && !state.user) fetchUser();
    else {
      dispatch({ type: "AUTH_LOADING", payload: false });
    }
  }, [state.token, state.user]);

  // Actions
  const setUser = (user) => {
    dispatch({ type: "SET_USER", payload: user });
  };

  const setToken = (token) => {
    localStorage.setItem("jwt", token);
    dispatch({ type: "SET_TOKEN", payload: token });
  };
  const setAuthLoading = (status) => {
    dispatch({ type: "AUTH_LOADING", payload: status });
  };

  return (
    <AppContext.Provider
      value={{ ...state, setUser, setToken, setAuthLoading }}
    >
      {children}
    </AppContext.Provider>
  );
};
