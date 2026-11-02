import { Link } from "wouter";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { SiteHeader, Mark } from "@/components/Brand";
import { useLanguage } from "@/lib/i18n";

const members = [
  { name: "Gislain Icyeza", role: "President", emoji: "🕵️‍♂️" },
  { name: "Lizzie Ange Iteriteka", role: "Manager", heart: true },
  { name: "Emerton Abudul Lazak", role: "Research team", emoji: "⚡" },
  { name: "Mame Gideon", role: "Research team", emoji: "🧠" },
  { name: "Denyse Mukeshimana", role: "Research team", emoji: "🌟" },
];
const choices = [
  {
    type: "CBHI member (community)",
    index: "01",
    label: "Community / CBHI members",
    detail:
      "Everyday experiences with Mutuelle de Santé, from enrolment to the care received.",
    code: "U · 36 questions",
    className: "choice-community",
  },
  {
    type: "MINALOC",
    index: "02",
    label: "MINALOC officials",
    detail:
      "Classification criteria, household transitions, appeals and evidence.",
    code: "M · 30 questions",
    className: "choice-minaloc",
  },
  {
    type: "RSSB",
    index: "03",
    label: "RSSB officials",
    detail: "CBHI financing, payments to facilities and member complaints.",
    code: "R · 31 questions",
    className: "choice-rssb",
  },
];
export default function Home() {
  const { t } = useLanguage();
  return (
    <div className="site">
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-line" />
                {t("ISOMO ACADEMY · ACTION RESEARCH")}
              </p>
              <p className="project-name">
                {t("REDESIGNING RWANDA'S HEALTH INSURANCE")}
              </p>
              <h1>
                {t("Looking closer.")}
                <br />
                <em>{t("Listening better.")}</em>
              </h1>
              <p className="hero-intro">
                {t("A student research project to understand how Rwanda's health insurance works in real lives—and how it could work better for everyone.")}
              </p>
              <a href="#interviews" className="button button-primary">
                {t("Begin an interview")} <ArrowRight size={17} />
              </a>
              <div className="hero-foot">
                <span>{t("RWANDA · OCT—NOV 2026")}</span>
                <span className="dot" /> <span>{t("FIELDWORK GUIDE")}</span>
              </div>
            </div>
            <div
              className="hero-art"
              aria-label={t("Illustration of an eye in a magnifying glass over a field notebook")}
            >
              <div className="art-rings">
                <div className="art-ring ring-one" />
                <div className="art-ring ring-two" />
              </div>
              <div className="art-note">
                <div className="note-label">
                  {t("FIELD NOTES")} <span>NO. 01</span>
                </div>
                <div className="note-rule" />
                <div className="note-title">
                  {t("A closer look")}
                  <br />
                  {t("at protection.")}
                </div>
                <div className="note-graphic">
                  <div className="graphic-cross">
                    <span />
                    <i />
                  </div>
                  <div className="graphic-orbit">
                    <Mark />
                  </div>
                  <div className="graphic-lines">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <div className="note-bottom">
                  <span>ISOMO ACADEMY</span>
                  <span>2026</span>
                </div>
              </div>
              <div className="art-caption">
                <span className="caption-index">01 / 03</span>
                <span>
                  {t("BETTER SYSTEMS BEGIN WITH")}
                  <br />
                  {t("BETTER QUESTIONS.")}
                </span>
              </div>
              <div className="art-spark spark-a" />
              <div className="art-spark spark-b" />
            </div>
            <a className="hero-scroll" href="#research">
              <span>{t("SCROLL TO EXPLORE")}</span>
              <ArrowDownRight size={15} />
            </a>
          </div>
        </section>
        <section id="research" className="question-section section-wrap">
          <div className="section-kicker">
            <span>{t("THE QUESTION")}</span>
            <span>01 — {t("OUR RESEARCH")}</span>
          </div>
          <div className="question-layout">
            <h2>
              {t("One question.")}
              <br />
              <span>{t("Many lived realities.")}</span>
            </h2>
            <blockquote>
              “{t("How can we redesign Rwanda's health insurance system to serve every citizen and provide adequate financial protection?")}”
            </blockquote>
          </div>
          <div className="focus-grid">
            <p className="focus-intro">
              {t("We are investigating the distance between being insured and feeling financially protected.")}
            </p>
            {[
              "Ubudehe classification and fairness",
              "CBHI members' healthcare experiences",
              "Health insurance financing",
              "How funding affects the services people receive",
            ].map((item, i) => (
              <div className="focus-item" key={item}>
                <span>0{i + 1}</span>
                <p>{t(item)}</p>
                <ArrowUpRight size={15} />
              </div>
            ))}
          </div>
        </section>
        <section id="interviews" className="interviews-section">
          <div className="section-wrap">
            <div className="section-kicker light-kicker">
              <span>{t("FIELDWORK")}</span>
              <span>02 — {t("THREE PERSPECTIVES")}</span>
            </div>
            <div className="interview-heading">
              <h2>{t("Choose the conversation.")}</h2>
              <p>
                {t("Each path follows the questions designed for that participant group. Start by speaking with them; the interviewer records answers here.")}
              </p>
            </div>
            <div className="choice-list">
              {choices.map((choice) => (
                <Link
                  href={`/interview?type=${encodeURIComponent(choice.type)}`}
                  className={`choice-row ${choice.className}`}
                  key={choice.type}
                  data-testid={`link-interview-${choice.index}`}
                >
                  <span className="choice-index">{choice.index}</span>
                  <div className="choice-copy">
                    <h3>{t(choice.label)}</h3>
                    <p>{t(choice.detail)}</p>
                  </div>
                  <span className="choice-code">
                    {choice.code.replace("questions", t("questions"))}
                  </span>
                  <span className="choice-arrow">
                    <ArrowUpRight size={20} />
                  </span>
                </Link>
              ))}
            </div>
            <p className="interview-note">
              <ShieldCheck size={16} /> {t("Taking part is voluntary. Interviewers enter responses after a verbal interview; participants do not fill this in.")}
            </p>
          </div>
        </section>
        <section className="process-section section-wrap">
          <div className="section-kicker">
            <span>{t("IN THE FIELD")}</span>
            <span>03 — {t("HOW IT WORKS")}</span>
          </div>
          <div className="process-heading">
            <h2>
              {t("Conversation first.")}
              <br />
              <em>{t("Record with care.")}</em>
            </h2>
            <p>
              {t("This tool is built for researchers conducting interviews—not for participants to complete alone.")}
            </p>
          </div>
          <div className="process-steps">
            <article>
              <span className="step-no">01</span>
              <div>
                <h3>{t("Explain the study")}</h3>
                <p>
                  {t("Share why we are here, how answers will be used, and that participation is voluntary.")}
                </p>
              </div>
              <BookOpen size={19} />
            </article>
            <article>
              <span className="step-no">02</span>
              <div>
                <h3>{t("Ask, listen, record")}</h3>
                <p>
                  {t("Interviewers read questions aloud and enter the participant’s own answers in the field.")}
                </p>
              </div>
              <Users size={19} />
            </article>
            <article>
              <span className="step-no">03</span>
              <div>
                <h3>{t("Respect every choice")}</h3>
                <p>
                  {t("Participants may skip any question or stop at any time, without consequence.")}
                </p>
              </div>
              <ShieldCheck size={19} />
            </article>
          </div>
          <div className="privacy-note">
            <div className="privacy-symbol">
              <ShieldCheck size={21} />
            </div>
            <p>
              <strong>{t("A note on this preview")}</strong>
              <br />
              {t("Responses stay temporarily in this browser session only. They are not saved permanently or securely, and disappear when the page is closed.")}
            </p>
          </div>
        </section>
        <section className="about-section">
          <div className="section-wrap about-layout">
            <div className="about-copy">
              <div className="section-kicker light-kicker">
                <span>{t("WHO WE ARE")}</span>
                <span>04 — {t("THE DETECTIVES")}</span>
              </div>
              <h2>
                {t("Curious students.")}
                <br />
                <em>{t("Questions that matter.")}</em>
              </h2>
              <p>
                {t("The Detectives are a student research team at Isomo Academy. Through action research, we are studying how health insurance financing shapes the care people receive—and what a fairer system could look like.")}
              </p>
              <Link href="/interview" className="text-link">
                {t("Meet us in the field")} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="team-roster">
              {members.map((member, i) => (
                <div className="team-row" key={member.name}>
                  <span className="team-number">0{i + 1}</span>
                  <span className="team-name">
                    {member.name}
                    {member.emoji && (
                      <span className="team-emoji" aria-hidden="true">
                        {member.emoji}
                      </span>
                    )}
                    {member.heart && (
                      <Heart
                        className="heart-icon"
                        size={15}
                        fill="currentColor"
                        aria-label={t("heart of the team")}
                      />
                    )}
                  </span>
                  <span className="team-role">{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Mark />
            <div>
              <strong>{t("THE DETECTIVES")}</strong>
              <span>{t("Isomo Academy · Rwanda")}</span>
            </div>
          </div>
          <p className="footer-tagline">
            {t("Better systems begin")}
            <br />
            {t("with better questions.")}
          </p>
          <div className="footer-contact">
            <a href="mailto:icyezagislain@gmail.com" data-testid="link-email">
              <Mail size={15} />
              icyezagislain@gmail.com
            </a>
            <a href="tel:+250799659914" data-testid="link-phone">
              <Phone size={15} />
              +250 799 659 914 --- Dilecteee
            </a>
          </div>
          <div className="footer-end">
            <span>
              <MapPin size={13} /> {t("RWANDA")}
            </span>
            <Link href="/admin" data-testid="link-footer-admin">
              {t("Research team access")} <ArrowUpRight size={14} />
            </Link>
            <small>© 2026 THE DETECTIVES</small>
            <span className="text-lg font-medium developer-credit"> 
             {t("Developed by Ayamikani Rukundo + Gislain")}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
