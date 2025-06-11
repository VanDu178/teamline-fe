import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./layouts/Main/Main";
import Home from "./pages/user/Home";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import ForgotPassword from "./pages/user/ForgotPassword";
import ResendLinkActive from "./pages/user/ResendLinkActive";
import VerifyEmail from "./pages/user/VerifyEmail";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resend-link" element={<ResendLinkActive />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/*" element={<Main />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
