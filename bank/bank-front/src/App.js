import {BrowserRouter} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import AppRouter from "./components/AppRouter";

function App() {
  return (
    <BrowserRouter>
      <AppRouter/>
      <ToastContainer position={'top-right'} theme="colored"/>
    </BrowserRouter>
  );
}

export default App;
