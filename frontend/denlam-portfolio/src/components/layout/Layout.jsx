import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import ScrollToHash from "./ScrollToHash.jsx";
import AntiCopyGuard from "./AntiCopyGuard.jsx";
import SplashScreen from "./SplashScreen.jsx";

export default function Layout() {
  return (
    <>
    <SplashScreen />
      <ScrollToHash />
      <AntiCopyGuard />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}