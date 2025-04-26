import { Route, Routes } from "react-router-dom";
import {
  ACCOUNTS_ROUTE,
  ATM_ROUTE, HIST_ROUTE,
  PROFILE_ROUTE,
  SIGN_IN_ROUTE,
  SIGN_UP_ROUTE,
  TRANSACTIONS_HIST_ROUTE, WORKPLACES_ROUTE,
} from "../utils/const";
import SignUp from "../pages/SignUp";
import Accounts from "../pages/Accounts";
import SignIn from "../pages/SignIn";
import Profile from "../pages/Profile";
import Atm from "../pages/Atm";
import TransactionHist from "../pages/TransactionHist";
import Hist from "../pages/Hist";
import Workplaces from "../pages/Workplaces";

const AppRouter = () => {
  return (
    <Routes>
      <Route path={"*"} Component={NotFound}/>
      <Route path={SIGN_IN_ROUTE} Component={SignIn}/>
      <Route path={SIGN_UP_ROUTE} Component={SignUp}/>
      <Route path={ACCOUNTS_ROUTE} Component={Accounts}/>
      <Route path={PROFILE_ROUTE} Component={Profile}/>
      <Route path={ATM_ROUTE} Component={Atm}/>
      <Route path={`${TRANSACTIONS_HIST_ROUTE}/:id`} Component={TransactionHist}/>
      <Route path={HIST_ROUTE} Component={Hist}/>
      <Route path={WORKPLACES_ROUTE} Component={Workplaces}/>
    </Routes>
  );
};

const NotFound = () => {
  return <>Not found!</>;
};

export default AppRouter;
