import React from "react";

export default function Documents() {
  return (
    <div className="documents">
      <h2>documents.</h2>
      <div className="projects doc">
        <a className="link" href="./sg_resume.pdf" target="_blank">
          <section>
            <div className="section_title">📄 Resume</div>
            <div className="about_section_OS">
              <span style={{ display: "block" }}>My professional resume.</span>
            </div>
            <div className="bottom_section">
              <span>
                <i className="far fa-file-pdf"></i>&nbsp;
              </span>
            </div>
          </section>
        </a>
        <a className="link" href="./sg_cover_letter.pdf" target="_blank">
          <section>
            <div className="section_title">📝 Cover Letter</div>
            <div className="about_section_OS">
              <span style={{ display: "block" }}>Letter of interest.</span>
            </div>
            <div className="bottom_section">
              <span>
                <i className="far fa-file-pdf"></i>&nbsp;
              </span>
            </div>
          </section>
        </a>
      </div>
      <h2>tech I know.</h2>
      <div className="tech">
        <i className="fa-brands fa-python fa-2x"></i>
        <i className="fa-brands fa-js fa-2x"></i>
        <i className="fa-brands fa-java fa-2x"></i>
        <i className="fa-brands fa-node fa-2x"></i>
        <i className="fa-brands fa-angular fa-2x"></i>
        <i className="fa-brands fa-react fa-2x"></i>
        <i className="fab fa-android fa-2x"></i>
        <i className="fab fa-html5 fa-2x"></i>
        <i className="fab fa-css3 fa-2x"></i>
        <i className="fas fa-code fa-2x"></i>
        <i className="fas fa-database fa-2x"></i>
        <i className="fab fa-mdb fa-2x"></i>
        <i className="fab fa-aws fa-2x"></i>
        <i className="fas fa-database fa-2x"></i>
        <i className="fas fa-database fa-2x"></i>
      </div>
      <h2>certifications.</h2>
      <br />
      <div className="articles">
        <article className="article">
          <div>
            <h2>AWS Certified Cloud Practitioner</h2>
            <div className="bottom_section">
              <a href="#">aws</a>
              <a href="#">cloud computing</a>
            </div>
          </div>
          <div className="date">MAY 2022</div>
        </article>
      </div>
    </div>
  );
}
