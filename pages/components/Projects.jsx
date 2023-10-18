import React from "react";
import data from "../data/user.json";
const projects = data.projects;

export default function Projects() {
  var projects_tem = projects.map((project, key) => {
    return (
      <article>
        <section>
          <div className="section_date">May 2020</div>
          <div className="section_title">{project.title}</div>
          <div className="about_section_OS">
            <span style={{ display: "block" }}>• {project.desc1}</span>
            <br />
            <span style={{ display: "block" }}>• {project.desc2}</span>
          </div>
          <div className="bottom_section">
            <a href="#">
              <i className="fas fa-solid fa-code"></i>&nbsp; github
            </a>
            <a href="#">
              <i className="fas fa-solid fa-link"></i>&nbsp; live link
            </a>
          </div>
        </section>
      </article>
    );
  });

  return (
    <div id="work">
      <div className="projects" id="work_section">
        {projects_tem}
      </div>
    </div>
  );
}
