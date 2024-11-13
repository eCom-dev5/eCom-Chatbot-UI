import LowerHeader from "../LowerHeader/LowerHeader.tsx";
import UpperHeader from "../UpperHeader/UpperHeader.tsx";

import styles from "./Header.module.css";


export default function Header() {
  return (
    <header className={styles.header}>
      <UpperHeader />
      <LowerHeader />
    </header>
  );
}
