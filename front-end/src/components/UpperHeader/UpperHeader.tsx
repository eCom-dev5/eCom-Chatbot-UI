import { Link } from "react-router-dom";

import MainNav from "../MainNav/MainNav";
import styles from "./UpperHeader.module.css";

export default function UpperHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logo}>
          Pixel<span className={styles.orange}> Pop</span>
        </Link>
      </div>
      <div className={styles.actions}>
        <Link to="/login" className={styles.login}>
          Log In
        </Link>
        <Link to="/register" className={styles.register}>
          Register
        </Link>
      </div>
    </div>
  );
}


