import { Link } from "react-router-dom";
import styles from "./LowerHeader.module.css";

export default function LowerHeader() {
  return (
    <div className={styles.header}>
      <ul className={styles.navLinks}>
        <li>
          <Link to="/" className={`${styles.link} ${styles.active}`}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/toys" className={styles.link}>
            Toys & Games
          </Link>
        </li>
        <li>
          <Link to="/video-games" className={styles.link}>
            Video Games
          </Link>
        </li>
      </ul>
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search for games or toys..."
          className={styles.searchInput}
        />
        <button className={styles.searchButton}>
          <i className="fa fa-search" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}

