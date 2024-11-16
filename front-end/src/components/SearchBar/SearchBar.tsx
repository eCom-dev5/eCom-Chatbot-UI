import { useState } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { TextField, IconButton, InputAdornment, Box } from "@mui/material";

// Import the CSS module
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedTerm = searchTerm.trim();  // Remove whitespace before & after
    setSearchTerm(trimmedTerm);

    if (trimmedTerm.length > 0) {
      navigate(`/search?q=${trimmedTerm}`);
    }
  }

  return (
    <Box className={styles["search-bar-container"]}>
      <form onSubmit={handleSubmit} className={styles["search-form"]}>
        <TextField
          variant="outlined"
          placeholder="Search Products"
          value={searchTerm}
          onChange={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  aria-label="Search"
                  className={styles["search-icon-btn"]}
                >
                  <MdOutlineSearch size={20} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          inputProps={{
            maxLength: 60, // Limit input length
          }}
          className={styles["search-input"]}
        />
      </form>
    </Box>
  );
}
