import React from 'react'

export default function About() {
  return (
    <div className="about-page">
      <h1>Contact</h1>
      <h3>Designed, constructed, and maintained by Hendrix Gullixson</h3>

      <p>
        <strong></strong>{' '}
        <a href="mailto:hgullixson@gmail.com"> hgullixson@gmail.com</a><br/>
        <strong>LinkedIn</strong>{' '}
        <a
          href="https://www.linkedin.com/in/hendrix-gullixson-a5a853bb/"
          target="_blank"
        >
          https://www.linkedin.com/in/hendrix-gullixson-a5a853bb/
        </a><br/>
        <strong>GitHub</strong>{' '}
        <a
          href="https://github.com/HendrixG/weather-app"
          target="_blank"
        >
          https://github.com/HendrixG/weather-app
        </a><br/>
        
      </p>
    </div>
  )
}