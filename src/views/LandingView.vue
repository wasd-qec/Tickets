<script setup lang="ts">
import { RouterLink } from 'vue-router'

const problems = [
  {
    title: 'Lost in Email Threads',
    description:
      'Support requests buried in inboxes or chat messages get overlooked with no clear owner.',
  },
  {
    title: 'Zero Status Visibility',
    description:
      'Employees are left guessing whether anyone is working on their issue or when it will be fixed.',
  },
  {
    title: 'Unclear Handoffs',
    description:
      'Technicians duplicate work or miss high-priority outages without a shared ticket queue.',
  },
]

const features = [
  {
    title: 'Structured Ticket Intake',
    description: 'Categorized issue reporting so technicians get the context they need upfront.',
  },
  {
    title: 'Role-Based Access',
    description: 'Dedicated workspaces tailored for Clients, Technicians, and Administrators.',
  },
  {
    title: 'Live Discussion Timeline',
    description: 'Keep comments and automated system status events in a single audit trail.',
  },
  {
    title: 'Priority & Status Tracking',
    description: 'Clear badges from Opened and In Progress through Resolved and Closed.',
  },
  {
    title: 'Smart Staff Queue',
    description: 'Search, filter by category or priority, and claim unassigned tickets in one click.',
  },
  {
    title: 'Category & User Management',
    description: 'Admins can organize issue categories and update team roles effortlessly.',
  },
]

const steps = [
  {
    step: '01',
    title: 'Submit a Ticket',
    description: 'A client chooses a category, describes the IT issue, and submits the request.',
  },
  {
    step: '02',
    title: 'Triage & Claim',
    description: 'A technician claims the ticket from the queue and sets the appropriate priority.',
  },
  {
    step: '03',
    title: 'Collaborate & Resolve',
    description: 'Updates and questions happen on the ticket timeline until the issue is resolved.',
  },
  {
    step: '04',
    title: 'Confirm & Close',
    description: 'Once verified, the ticket is closed and archived for a complete record.',
  },
]

const roles = [
  {
    role: 'Client',
    badgeClass: 'badge-gray',
    description:
      'Submit new support requests, follow progress in real time, reply to technicians, and close resolved tickets.',
  },
  {
    role: 'Technician',
    badgeClass: 'badge-blue',
    description:
      'Work from a filtered queue, claim unassigned issues, adjust priority and status, and communicate with clients.',
  },
  {
    role: 'Admin',
    badgeClass: 'badge-purple',
    description:
      'Full technician capabilities plus category management, comment moderation, and instant user role assignment.',
  },
]
</script>

<template>
  <div class="landing-page">
    <header class="landing-nav">
      <div class="landing-container nav-inner">
        <RouterLink to="/" class="brand-logo">
          <span class="brand-icon">HD</span>
          <span class="brand-text">HelpDesk</span>
        </RouterLink>

        <nav class="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#roles">Roles</a>
        </nav>

        <div class="nav-actions">
          <RouterLink to="/login" class="btn btn-secondary">Log in</RouterLink>
          <RouterLink to="/Register" class="btn btn-primary">Register</RouterLink>
        </div>
      </div>
    </header>

    <section class="hero-section">
      <div class="landing-container hero-inner">
        <span class="hero-pill">IT Support Ticketing System</span>
        <h1 class="hero-headline">Every IT issue tracked from report to resolution.</h1>
        <p class="hero-subtext">
          A clean, role-based helpdesk that keeps clients informed, technicians focused, and
          administrators in control.
        </p>
        <div class="hero-buttons">
          <RouterLink to="/Register" class="btn btn-primary btn-lg">Get started</RouterLink>
          <RouterLink to="/login" class="btn btn-secondary btn-lg">Log in</RouterLink>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="landing-container">
        <div class="section-header">
          <h2 class="section-title">Why ad-hoc IT support breaks down</h2>
          <p class="section-subtitle">
            Managing support through chat messages and spreadsheets slows everyone down.
          </p>
        </div>
        <div class="grid-3">
          <div v-for="item in problems" :key="item.title" class="card info-card">
            <h3 class="card-heading">{{ item.title }}</h3>
            <p class="card-copy">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="section section-alt">
      <div class="landing-container">
        <div class="section-header">
          <h2 class="section-title">Everything your support team needs</h2>
          <p class="section-subtitle">
            Focused tools built for fast triage, transparent communication, and clean accountability.
          </p>
        </div>
        <div class="grid-3">
          <div v-for="feat in features" :key="feat.title" class="card info-card">
            <div class="feature-dot"></div>
            <h3 class="card-heading">{{ feat.title }}</h3>
            <p class="card-copy">{{ feat.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="how-it-works" class="section">
      <div class="landing-container">
        <div class="section-header">
          <h2 class="section-title">How it works</h2>
          <p class="section-subtitle">Four straightforward steps from initial report to closure.</p>
        </div>
        <div class="timeline-steps">
          <div v-for="item in steps" :key="item.step" class="card step-card">
            <span class="step-badge">{{ item.step }}</span>
            <h3 class="card-heading">{{ item.title }}</h3>
            <p class="card-copy">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="roles" class="section section-alt">
      <div class="landing-container">
        <div class="section-header">
          <h2 class="section-title">Built for every role</h2>
          <p class="section-subtitle">
            Clear permissions ensure everyone sees only what matters to their workflow.
          </p>
        </div>
        <div class="grid-3">
          <div v-for="r in roles" :key="r.role" class="card info-card">
            <div class="role-badge" :class="r.badgeClass">{{ r.role }}</div>
            <h3 class="card-heading">{{ r.role }} Workspace</h3>
            <p class="card-copy">{{ r.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="landing-container">
        <div class="cta-banner">
          <h2 class="cta-title">Ready to streamline your IT support?</h2>
          <p class="cta-subtitle">
            Create an account in seconds and start tracking every support request in one place.
          </p>
          <RouterLink to="/Register" class="btn cta-btn">Create free account</RouterLink>
        </div>
      </div>
    </section>

    <footer class="landing-footer">
      <div class="landing-container footer-inner">
        <div class="brand-logo">
          <span class="brand-icon">HD</span>
          <span class="brand-text">HelpDesk</span>
        </div>
        <p class="footer-copy">&copy; 2026 HelpDesk IT Support. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  color: #0f172a;
}

.landing-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 1.5rem;
  width: 100%;
}

.landing-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #e2e8f0;
}

.nav-inner {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: #0f172a;
  text-decoration: none;
}

.brand-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.75rem;
}

.nav-links a {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
}

.nav-links a:hover {
  color: #2563eb;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #ffffff;
  border-color: #e2e8f0;
  color: #0f172a;
}

.btn-secondary:hover {
  background-color: #f1f5f9;
}

.btn-lg {
  padding: 0.7rem 1.5rem;
  font-size: 0.95rem;
}

.hero-section {
  padding: 5rem 0 4rem;
  text-align: center;
  background: linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%);
}

.hero-inner {
  max-width: 760px;
}

.hero-pill {
  display: inline-block;
  padding: 0.3rem 0.85rem;
  border-radius: 9999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.hero-headline {
  font-size: 2.6rem;
  line-height: 1.2;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 1.25rem;
}

.hero-subtext {
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.section {
  padding: 4rem 0;
}

.section-alt {
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.section-header {
  text-align: center;
  max-width: 620px;
  margin: 0 auto 2.5rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
}

.info-card {
  display: flex;
  flex-direction: column;
}

.feature-dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background-color: #2563eb;
  margin-bottom: 0.85rem;
}

.role-badge {
  display: inline-block;
  align-self: flex-start;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.badge-gray { background-color: #f1f5f9; color: #475569; }
.badge-blue { background-color: #dbeafe; color: #1d4ed8; }
.badge-purple { background-color: #f3e8ff; color: #7e22ce; }

.card-heading {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 0.45rem;
}

.card-copy {
  font-size: 0.875rem;
  color: #64748b;
}

.timeline-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.step-card {
  display: flex;
  flex-direction: column;
}

.step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 8px;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 700;
  font-size: 0.875rem;
  margin-bottom: 0.85rem;
}

.cta-banner {
  background: #2563eb;
  color: #ffffff;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
}

.cta-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.cta-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.cta-btn {
  background: #ffffff;
  color: #2563eb;
  font-weight: 600;
  padding: 0.7rem 1.5rem;
}

.cta-btn:hover {
  background: #f8fafc;
}

.landing-footer {
  margin-top: auto;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 1.5rem 0;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-copy {
  font-size: 0.85rem;
  color: #64748b;
}

@media (max-width: 900px) {
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
  .timeline-steps { grid-template-columns: repeat(2, 1fr); }
  .hero-headline { font-size: 2.1rem; }
}

@media (max-width: 600px) {
  .nav-links { display: none; }
  .grid-3, .timeline-steps { grid-template-columns: 1fr; }
}
</style>
