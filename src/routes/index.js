
import {Navigate ,useRoutes} from "react-router-dom";
import Dashboard from "../pages/dashboard/dashboard.jsx";
import DashboardLayout from "../layout/dashboardLayout.js";
import RegisterStudent from "../pages/auth/register.js";
import Login from "../pages/auth/login.js";
import PastPapers from "../pages/pastPapers/pastpapers.js";
import PaperAttempt from "../pages/paperAttempt/paperAttempt.js";
import Sessions from "../pages/sessions/sessions.js";
import EvaluatedSession from "../pages/sessions/evaluatedSession.js";
import Notification from "../pages/Notificarion/notification.js";
function AppRoutes() {
  const UserRole =JSON.parse(localStorage.getItem('UserData'))
  console.log("🚀 ~ Sidebar ~ Role:", UserRole)
  const routes = useRoutes([
    {
      path: '/b2c/dashboard',
      element: <DashboardLayout />,
      children: [
        {
          index: true,
          element: <Dashboard />,
        },
        {
          path: 'pastPapers',
          element: <PastPapers />,
        },
        {
          path: 'paperAttempt',
          element: <PaperAttempt />,
        },
        {
          path: 'sessions',
          element: <Sessions />,
        },
        {
          path: 'evaluatedSession',
          element: <EvaluatedSession />,
        },
        {
          path: 'notification',
          element: <Notification />,
        },
        // {
        //   element:UserRole?.role === 'teacher'? <Navigate to="/dashboard/teacher" />:<Navigate to="/dashboard/student" />,
        //   index: true
        // },
        // {
        //   path:UserRole?.role === 'teacher'? 'teacher':'student',
        //   element: UserRole?.role === 'teacher' 
        //     ? <TeacherDashboard /> 
        //     : UserRole?.role === 'student' 
        //       ? <StudentDashboard /> 
        //       : <Navigate to="/" />, 
        // },
      ]
    },
    // {
    //   path: '/j/:code',
    //   element: <JoinRedirect />
    // },
    // {
    //   path: '/',
    //   element: <LandingPage />
    // },
    // {
    //   path: '/for-teacher',
    //   element: <LandingPage />
    // },
    // {
    //   path: '/schools',
    //   element: <SchoolsPage />
    // },
    // {
    //   path: '/pricing',
    //   element: <PricingPage />
    // },
    // {
    //   path: '/contact',
    //   element: <ContactPage />
    // },
    // {
    //   path: '/privacy-policy',
    //   element: <PrivacyPolicy />
    // },
    // {
    //   path: '/term-of-services',
    //   element: <TermsOfServices />
    // },
    // {
    //   path: '/about',
    //   element: <AboutPage />
    // },
    // {
    //   path: '/career',
    //   element: <CareerPage />
    // },
    {
      path: '/',
      element: <Navigate to="/b2c/" replace />
    },
    {
      path: '/b2c/',
      element: <Login />
    },
    {
      path: '/b2c/register/student',
      element: <RegisterStudent/>
    },

    // {
    //   path: '/forgot-password',
    //   element: <ForgotPassword/>
    // },
    // {
    //   path: '/reset-password/:token',
    //   element: <ResetPassword/>
    // },

  ])
  return routes;
}

export default AppRoutes;

