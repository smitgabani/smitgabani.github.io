import ContactForm from "../ContactForm";
import Icon from "../Icon";

export default function Contact({ user }) {
  return (
    <section
      id="contact"
      className="py-20 bg-gradient-to-r from-purple-900/50 via-gray-950 to-cyan-900/50"
      aria-labelledby="cta-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Text & Links */}
          <div>
            <h2
              id="cta-heading"
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Interested in working together?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Let&apos;s build scalable systems and robust infrastructure.
            </p>

            <nav
              className="flex flex-wrap gap-4 mb-8"
              aria-label="Contact actions"
            >
              <a
                href={user.links.email}
                className="px-8 py-4 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-950"
                aria-label="Send me an email"
              >
                Email Me →
              </a>
            </nav>

            {/* Quick Contact Info */}
            <div className="space-y-3 text-gray-400">
              <p className="flex items-center gap-3">
                <Icon name="mail" className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <a
                  href={user.links.email}
                  className="hover:text-white transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                >
                  {user.email}
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Icon name="phone" className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <a
                  href={`tel:${user.phone.replace(/[^0-9+]/g, "")}`}
                  className="hover:text-white transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                >
                  {user.phone}
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Icon name="location" className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span>{user.location}, Canada</span>
              </p>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-2">
              Drop me a line
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              No formal stuff here — just real talk.
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
