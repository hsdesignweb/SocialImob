/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import InputStep from "./pages/InputStep";
import RefinementStep from "./pages/RefinementStep";
import ResultsStep from "./pages/ResultsStep";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Payment from "./pages/Payment";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but hasn't paid, redirect to payment
  // Unless they are already on the payment page (which is handled by the route structure below)
  // But wait, Payment page is outside this ProtectedRoute wrapper?
  // No, Payment page should be accessible to authenticated users who haven't paid.
  // So we need a check here.
  
  if (user && user.isPaid === false && user.status !== 'trial') {
      return <Navigate to="/payment" replace />;
  }

  return <>{children}</>;
};

// Payment Route Guard (Only for authenticated users who need to pay)
const PaymentRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    if (user?.isPaid) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/payment" element={
                <PaymentRoute>
                    <Payment />
                </PaymentRoute>
            } />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />
              <Route path="input" element={<InputStep />} />
              <Route path="refinement" element={<RefinementStep />} />
              <Route path="results" element={<ResultsStep />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
