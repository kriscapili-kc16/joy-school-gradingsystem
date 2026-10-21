# JOY SCHOOL - Cloud-Based Academic Grading Portal

A responsive, real-time web application engineered for managing student academic records, entering quarterly marks across 10 core subjects, calculating Grade-Weighted Averages (GWA), and generating batch PDF report cards.

 **[View Live Web Portal](https://kriscapili-kc16.github.io/joy-school-gradingsystem/)**

---

##  Tech Stack

* **Frontend UI / Styling:** HTML5, CSS3, [Tailwind CSS](https://tailwindcss.com/) (CDN), FontAwesome Icons
* **Client-Side Logic:** Modern Vanilla JavaScript (ES6+)
* **Cloud Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore) (Real-time NoSQL synchronization)
* **Local Data Persistence:** HTML5 `localStorage` (Offline fallback mechanism)
* **Hosting & Deployment:** GitHub Pages
* **PDF Engine:** Custom CSS Print Media Queries (`@media print`) for multi-page PDF generation

---

##  Key Features

- **Role-Based Access Control (RBAC):** Separate Administrator and Teacher accounts with direct passkey/PIN configuration.
- **Dynamic Class Management:** Admin panel to register new grade levels and sections (e.g., Grade 12A) with natural numerical tab sorting (**7A** through **12A**).
- **Real-Time Data Sync:** Multi-device synchronization powered by Firebase Cloud Firestore.
- **Official Form Exports:** 1-click generation of Class Summaries, Rankings, and Individual Student Report Cards.
- **Offline Data Backup:** Native JSON export and import tools for offline record keeping.

---

## 🚀 How to Run Locally

1. Clone or download this repository.
2. Open `index.html` directly in any modern web browser.
