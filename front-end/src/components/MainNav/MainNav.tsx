import { useState, useEffect } from "react";
import { NavLink, useNavigate, useRouteLoaderData } from "react-router-dom";
import { AuthData } from "../../features/auth/authData";
import styles from "./MainNav.module.css";

export default function MainNav() {
  const authData = useRouteLoaderData("app") as AuthData;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Toggle menu visibility
  function toggleMenu() {
    setMenuOpen((prev) => !prev);
  }

  // Close menu when navigating
  function handleNavClick() {
    setMenuOpen(false);
  }

  // Disable scrolling when the menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

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
      navigate(0); // Refresh page to clear auth state and re-render
    }
  }

  // Function to render nav items
  function renderNavItem(path: string, anchor: string, onClick?: () => void) {
    return (
      <li className={styles.listItem} onClick={handleNavClick}>
        <NavLink to={path} className={styles.link} onClick={onClick}>
          {anchor}
        </NavLink>
      </li>
    );
  }

  return (
    <>
      <nav className={styles.mainNav}>
        <button className={styles.hamburger} onClick={toggleMenu}>
          <span className={styles.hamburgerBar}></span>
          <span className={styles.hamburgerBar}></span>
          <span className={styles.hamburgerBar}></span>
        </button>
        <ul className={`${styles.navList} ${menuOpen ? styles.open : ""}`}>
          {authData?.logged_in ? (
            <>
              {renderNavItem("/account", "Account")}
              {renderNavItem("/cart", "Cart")}
              {renderNavItem("#", "Log Out", handleClickLogOut)}
            </>
          ) : (
            <>
              {renderNavItem("/login", "Log In")}
              {renderNavItem("/register", "Register")}
            </>
          )}
        </ul>
      </nav>
      {menuOpen && <div className={styles.overlay} onClick={toggleMenu}></div>}
    </>
  );
}
