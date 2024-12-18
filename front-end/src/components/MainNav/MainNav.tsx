import { NavLink, useNavigate, useRouteLoaderData } from "react-router-dom";
import { AuthData } from "../../features/auth/authData";
import styles from "./MainNav.module.css";

export default function MainNav() {
  const authData = useRouteLoaderData("app") as AuthData;
  const navigate = useNavigate();

  // Log out handler
  async function handleClickLogOut() {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/auth/logout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("Unexpected status code.");
      }
    } catch (error) {
      console.log(error);
    } finally {
      navigate(0);  // Refresh page to clear auth state and re-render
    }
  }

  // Function to render nav items
  function renderNavItem(path: string, anchor: string, onClick?: () => void) {
    return (
      <li className={styles.listItem}>
        <NavLink to={path} className={styles.link} onClick={onClick}>{anchor}</NavLink>
      </li>
    );
  }

  return (
    <nav className={styles.mainNav}>
      {/* Only authenticated routes */}
      {authData?.logged_in ? (
        <ul className={styles.navList}>
          {renderNavItem("/account", "Account")}
          {renderNavItem("/cart", "Cart")}
          {renderNavItem("#", "Log Out", handleClickLogOut)}
        </ul>
      ) : (
        <ul className={styles.navList}>
          {renderNavItem("/login", "Log In")}
          {renderNavItem("/register", "Register")}
        </ul>
      )}
    </nav>
  );
}
