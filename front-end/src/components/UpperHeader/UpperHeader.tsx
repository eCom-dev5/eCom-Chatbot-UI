import { Link } from "react-router-dom";

import MainNav from "../MainNav/MainNav";
import styles from "./UpperHeader.module.css";

<div className={styles.upperHeader}>
  <span>📞 +1 800-123-4567 | 📧 support@shopmate.com</span>
  <div className={styles.socials}>
    <a href="#"><i className="fa fa-facebook"></i></a>
    <a href="#"><i className="fa fa-twitter"></i></a>
    <a href="#"><i className="fa fa-instagram"></i></a>
  </div>
</div>

export default function UpperHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logo}>Pixel<span className={styles.orange}> Pop</span></Link>
      </div>
      <MainNav />
    </div>
  );
}
