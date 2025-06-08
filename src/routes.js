import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./layouts/Main/Main";
import Home from "./pages/user/Home";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
