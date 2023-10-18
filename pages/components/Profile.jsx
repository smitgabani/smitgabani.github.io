import React from 'react'
import styles from '../../styles/Home.module.css'

export default function Profile() {
  return (
    <div className={styles.profile}>
      <div id="img-container">
				<img src="smitgabani.jpg" alt="" className="profile-pic"/>
			</div><br/><br/>
			<div id="user">
				
			</div>
			<div id="about">
				<p>
					I am <span style={{fontWeight: 1000}}>Smit Gabani</span>. I am a computer programmer student looking for co-op for the Summer 2022 term.
				</p>
				<p>
					I am interested in web-development and building application. I am always looking for using my new learned skills to use.
				</p>
				<p>
					I follow everything in technology, football, finance, and space exploration.
				</p>
				<p style={{fontWeight:"bolder"}}>
					#js, #py, #cpp
				</p>
			</div>
			<div id="socials">
				<div className="socials">
					<span style={{display:"block"}}><a href="https://linkedin.com/in/smit-gabani/" target="_blank"
						className="socials"><i className="fab fa-linkedin-in"></i></a></span>
					<span style={{display:"block"}}><a href="https://github.com/smitgabani/" target="_blank" className="socials"><i
						className="fab fa-github"></i></a></span>
					<span style={{display:"block"}}><a href="https://twitter.com/SmitGabani7/" target="_blank"
						className="socials"><i className="fab fa-twitter"></i></a></span>
					<span style={{display:"block"}}><a href="mailto: gabanismit11@gmail.com" target="_blank"
						className="socials"><i className="fas fa-envelope"></i></a></span>
				</div>
				<div className="sidebar__inner "></div>
			</div>
			<div id="end">
        </div>
    </div>
  )
}
