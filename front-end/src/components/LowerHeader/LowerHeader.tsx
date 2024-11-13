import SearchBar from "../SearchBar/SearchBar.tsx";

import styles from "./LowerHeader.module.css";


export default function LowerHeader() {
  return (
    <div className={styles.header}>
      <SearchBar />
    </div>
  );
}
