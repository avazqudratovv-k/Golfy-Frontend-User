import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSort } from "../slice";
import { retrieveSort } from "../selector";

export default function FilterBar() {
  const dispatch = useDispatch();
  const sort = useSelector(retrieveSort);

  const options: { label: string; value: "cheap" | "expensive" | "popular" }[] =
    [
      { label: "Cheapest", value: "cheap" },
      { label: "Most expensive", value: "expensive" },
      { label: "Most booked", value: "popular" },
    ];

  return (
    <div className="filter-bar">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={sort === opt.value ? "filter-btn active" : "filter-btn"}
          onClick={() => dispatch(setSort(opt.value))}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
