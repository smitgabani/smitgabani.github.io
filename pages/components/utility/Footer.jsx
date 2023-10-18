import React from "react";
import styles from "../../../styles/Home.module.css";

export default function Footer() {
  return (
    <footer id="footer">
      <span>Made by Smit Gabani.</span>
      <br />
      <span style={{ background: "#DCDCDC", color: "#806000" }}>
        <u>
          <i>_nextJS_</i>
        </u>
      </span>{" "}
      website
      <br />
      Soon to be made with{" "}
      <u>
        <i>typescript</i>
      </u>
    </footer>
  );
}
