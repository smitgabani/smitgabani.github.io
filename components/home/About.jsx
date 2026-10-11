export default function About({ user }) {
  return (
    <section
      id="about"
      className="py-20 bg-gray-950"
      aria-labelledby="about-heading"
      itemScope
      itemType="https://schema.org/Person"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <figure className="flex justify-center order-2 lg:order-1">
            <div className="w-80 h-80 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-2xl border border-gray-800 overflow-hidden">
              <img
                src="/smitgabani.jpg"
                alt={`${user.name} - ${user.title} based in ${user.location}`}
                className="w-full h-full object-cover"
                itemProp="image"
                loading="lazy"
                width="320"
                height="320"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `<span class="text-gray-500 flex items-center justify-center h-full">${user.name}</span>`;
                }}
              />
            </div>
          </figure>

          {/* Content */}
          <article className="order-1 lg:order-2">
            <h2
              id="about-heading"
              className="text-3xl font-bold text-white mb-6"
            >
              About Me
            </h2>
            <div itemProp="description">
              {user.bio.map((paragraph, index) => (
                <p key={index} className="text-gray-400 text-lg mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Hidden SEO data */}
            <meta itemProp="name" content={user.name} />
            <meta itemProp="jobTitle" content={user.title} />
            <meta itemProp="email" content={user.email} />
            <meta itemProp="telephone" content={user.phone} />
            <span
              itemProp="address"
              itemScope
              itemType="https://schema.org/PostalAddress"
              className="hidden"
            >
              <meta
                itemProp="addressLocality"
                content={user.location}
              />
              <meta itemProp="addressCountry" content="Canada" />
            </span>

            {/* Certifications */}
            {user.certifications && user.certifications.length > 0 && (
              <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Certifications
                </h3>
                <ul
                  className="space-y-1"
                  aria-label="Professional certifications"
                >
                  {user.certifications.map((cert, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2"
                      itemProp="hasCredential"
                      itemScope
                      itemType="https://schema.org/EducationalOccupationalCredential"
                    >
                      <span
                        className="text-cyan-400"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      <span className="text-gray-400" itemProp="name">
                        {cert.name}
                      </span>
                      <span className="text-gray-600 text-sm">
                        (<time itemProp="dateCreated">{cert.date}</time>
                        )
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Education */}
            <div
              className="mt-6"
              itemProp="alumniOf"
              itemScope
              itemType="https://schema.org/EducationalOrganization"
            >
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Education
              </h3>
              {user.education.map((edu, index) => (
                <div key={index} className="text-gray-400">
                  <span className="text-white">{edu.degree}</span>
                  <span className="text-gray-500">
                    {" "}
                    • <span itemProp="name">{edu.institution}</span>
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
