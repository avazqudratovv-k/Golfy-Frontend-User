import React, { useState, useEffect } from "react";
import { InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch } from "react-redux";
import { setSearch } from "../slice";

export default function SearchBar() {
  const dispatch = useDispatch();
  const [value, setValue] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(setSearch(value));
    }, 400);
    return () => clearTimeout(timeout);
  }, [value, dispatch]);

  return (
    <div className="search-bar">
      <SearchIcon className="search-icon" />
      <InputBase
        placeholder="Search venues by name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        fullWidth
      />
    </div>
  );
}
