import { NavLink } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import styles from "./LowerHeader.module.css";

export default function LowerHeader() {
  // Function to render nav items
  function renderNavItem(path: string, anchor: string) {
    return (
      <li className={styles.listItem}>
        <NavLink to={path} className={styles.link}>{anchor}</NavLink>
      </li>
    );
  }

  return (
    
    <div className={styles.header}>
      <ul className={styles.navList}>
        {renderNavItem("/", "Home")}
      </ul>
      <ul className={styles.navList}>
        {renderNavItem( "/category/Toys & Games", "Toys & Games")}
      </ul>
      <ul className={styles.navList}>
        {renderNavItem("/category/Video Games", "Video Games")}
      </ul>
      <SearchBar/>
    </div>
  );
}
