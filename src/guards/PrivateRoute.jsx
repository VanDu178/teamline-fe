import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SkeletonLayout from "../layouts/SkeletonLayout/Skeleton";

const PrivateRoute = ({ children }) => {
    const { userId, isAuthenticated, user, isCheckingLogin } = useAuth();
    if (isCheckingLogin) {
        return <SkeletonLayout />
    }
    return userId && isAuthenticated && user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
