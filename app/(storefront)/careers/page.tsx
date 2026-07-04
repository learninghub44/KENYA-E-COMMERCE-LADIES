import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Careers — Zuri Market",
  description:
    "Join the Zuri Market team and help build the future of digital commerce in Kenya.",
}

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Careers at Zuri Market
        </h1>
        <p className="mt-3 text-lg font-medium text-[#1C5C56]">
          Build the Future of Digital Commerce
        </p>
      </div>

      <div className="space-y-10 text-gray-600 leading-relaxed">
        {/* Intro */}
        <section>
          <p>
            At Zuri Market, we&apos;re building more than an online marketplace—we&apos;re creating technology that helps businesses grow and makes online shopping more accessible across Kenya.
          </p>
          <p className="mt-3">
            We&apos;re always looking for talented, curious, and passionate people who want to solve real problems, learn continuously, and make a meaningful impact.
          </p>
          <p className="mt-3">
            Whether you&apos;re an experienced professional, a recent graduate, or a student eager to gain practical experience, we&apos;d love to hear from you.
          </p>
        </section>

        <hr className="border-gray-200" />

        {/* Why Work With Us */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Why Work With Us?</h2>
          <p>
            Working at Zuri Market means being part of a team that values innovation, collaboration, and continuous improvement.
          </p>
          <p className="mt-3">
            We&apos;re building products that empower entrepreneurs, support local businesses, and create better shopping experiences for thousands of users.
          </p>
          <p className="mt-3">
            Every contribution matters, and every team member has the opportunity to influence the future of our platform.
          </p>
        </section>

        {/* Our Culture */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Our Culture</h2>
          <p>We believe great companies are built by great people. Our culture is based on:</p>

          <div className="mt-4 space-y-4">
            <div>
              <h3 className="mb-1 font-medium text-gray-800">Innovation</h3>
              <p>We encourage creativity, experimentation, and new ideas. We believe the best solutions often come from asking better questions.</p>
            </div>
            <div>
              <h3 className="mb-1 font-medium text-gray-800">Integrity</h3>
              <p>We value honesty, accountability, and professionalism in everything we do.</p>
            </div>
            <div>
              <h3 className="mb-1 font-medium text-gray-800">Collaboration</h3>
              <p>We believe the best results come from working together, sharing knowledge, and supporting one another.</p>
            </div>
            <div>
              <h3 className="mb-1 font-medium text-gray-800">Continuous Learning</h3>
              <p>Technology evolves quickly, and so do we. Learning is part of our daily work, and we encourage every team member to develop new skills.</p>
            </div>
            <div>
              <h3 className="mb-1 font-medium text-gray-800">Customer Focus</h3>
              <p>Every decision we make begins with understanding the needs of our users. We strive to create products that genuinely improve the experiences of buyers and sellers.</p>
            </div>
          </div>
        </section>

        {/* Who We're Looking For */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Who We&apos;re Looking For</h2>
          <p>As Zuri Market grows, we expect opportunities in areas such as:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6 columns-2">
            <li>Software Engineering</li>
            <li>Frontend Development</li>
            <li>Backend Development</li>
            <li>Mobile App Development</li>
            <li>UI/UX Design</li>
            <li>Product Management</li>
            <li>Quality Assurance (QA)</li>
            <li>DevOps &amp; Cloud Infrastructure</li>
            <li>Cybersecurity</li>
            <li>Data Analysis</li>
            <li>Customer Support</li>
            <li>Vendor Success</li>
            <li>Sales &amp; Business Development</li>
            <li>Marketing</li>
            <li>Digital Marketing</li>
            <li>Content Creation</li>
            <li>Finance &amp; Administration</li>
            <li>Human Resources</li>
            <li>Operations</li>
            <li>Logistics Partnerships</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">Job availability may change depending on our business needs.</p>
        </section>

        {/* Students & Graduates */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Students &amp; Graduates</h2>
          <p>
            We believe in supporting the next generation of technology professionals. Students and recent graduates are encouraged to apply for internship, industrial attachment, graduate trainee, or mentorship opportunities whenever they become available.
          </p>
          <p className="mt-3">
            We value curiosity, willingness to learn, and problem-solving ability just as much as technical experience.
          </p>
        </section>

        {/* What We Look For */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">What We Look For</h2>
          <p>While each role has its own requirements, we generally look for people who:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Take initiative.</li>
            <li>Communicate effectively.</li>
            <li>Enjoy solving problems.</li>
            <li>Work well in teams.</li>
            <li>Learn quickly.</li>
            <li>Adapt to change.</li>
            <li>Demonstrate professionalism.</li>
            <li>Respect diverse perspectives.</li>
            <li>Share our commitment to building high-quality products.</li>
          </ul>
        </section>

        {/* Hiring Process */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Our Hiring Process</h2>
          <p>Our recruitment process may include:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-6">
            <li>Application review.</li>
            <li>Initial screening.</li>
            <li>Skills assessment (where applicable).</li>
            <li>Interview(s).</li>
            <li>Reference checks (if required).</li>
            <li>Final decision.</li>
          </ol>
          <p className="mt-3 text-sm text-gray-500">The exact process may vary depending on the position.</p>
        </section>

        {/* Equal Opportunity */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Equal Opportunity</h2>
          <p>
            Zuri Market is committed to providing equal opportunities to all applicants. Recruitment decisions are based on qualifications, experience, skills, and the requirements of each role.
          </p>
          <p className="mt-3">
            We strive to create an inclusive, respectful, and professional working environment where everyone has the opportunity to succeed.
          </p>
        </section>

        {/* Current Openings */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Current Openings</h2>
          <p>We may not always have active vacancies available.</p>
          <p className="mt-3">
            Even if there are no current openings that match your experience, we encourage you to send your CV for future consideration. Applications are reviewed when suitable opportunities arise.
          </p>
        </section>

        {/* Submit Application */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Submit Your Application</h2>
          <p>If you are interested in joining the Zuri Market team, please send us:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Your updated CV or résumé.</li>
            <li>A brief cover letter introducing yourself.</li>
            <li>The role or area you are interested in.</li>
            <li>Links to your portfolio, GitHub, LinkedIn, or previous work (where applicable).</li>
          </ul>
          <p className="mt-3">Please send your application to:</p>
          <div className="mt-2">
            <p className="font-medium text-gray-800">
              Email:{" "}
              <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">
                hello@zurimarket.co.ke
              </a>
            </p>
          </div>
        </section>

        {/* Founder Message */}
        <section className="rounded-lg bg-gray-50 p-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">A Message from Our Founder</h2>
          <blockquote className="italic text-gray-600 leading-relaxed">
            &ldquo;Building a great company starts with building a great team. At Zuri Market, we believe talented people can come from anywhere. If you&apos;re passionate about technology, innovation, and creating solutions that make a difference, we&apos;d love to hear from you.
          </blockquote>
          <blockquote className="mt-3 italic text-gray-600 leading-relaxed">
            As we continue growing, our goal is to build a workplace where people are empowered to learn, contribute, and grow alongside the company.&rdquo;
          </blockquote>
          <p className="mt-4 font-medium text-gray-800">&mdash; Chris Odhiambo</p>
          <p className="text-sm text-gray-500">Founder, Zuri Market</p>
        </section>

        {/* Join Us */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Join Us</h2>
          <p>
            The future of commerce is being shaped by people who are willing to build, learn, and innovate.
          </p>
          <p className="mt-3">
            If you believe your skills, ideas, and passion can help us create a better marketplace for buyers and sellers across Kenya, we invite you to become part of our journey.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            We look forward to hearing from you.
          </p>
        </section>
      </div>
    </div>
  )
}
