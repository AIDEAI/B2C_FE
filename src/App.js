import logo from './logo.svg';
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { PastPapersProvider } from "./context/PastPapersContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
function App() {
  return (
    <>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <PastPapersProvider>
          <AppRoutes/>
          <ToastContainer/>
        </PastPapersProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
    </>
  );
}

export default App;
