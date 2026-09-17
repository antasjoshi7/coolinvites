/* ==========================================================================
   The Cool Shaadi Invites — Moving Testimonials Marquee Belt
   ========================================================================== */

(function () {
  'use strict';

  const testimonialsData = [
    {
      names: "Rohan & Aishwarya",
      city: "New Delhi · Bella Monde",
      initials: "R & A",
      stars: 5,
      quote: "Our guests literally called us non-stop after getting our link saying it was the most gorgeous wedding invite they'd ever seen! The personalized links for college friends vs family elders was a game changer."
    },
    {
      names: "Aditya & Tanya",
      city: "Mumbai · Taj Lands End",
      initials: "A & T",
      stars: 5,
      quote: "Saved us over ₹45,000 on physical printing & couriers. The Google Maps button and WhatsApp RSVP made everything completely effortless for our outstation guests."
    },
    {
      names: "Kabir & Meera",
      city: "Jaipur · Fairmont",
      initials: "K & M",
      stars: 5,
      quote: "The 'Know the Couple' story section made our wedding so deeply personal. It's not just an invite, it's a digital keepsake we will cherish forever. Worth 10x the ₹3,999!"
    },
    {
      names: "Arjun & Pooja",
      city: "Bengaluru · Palace Grounds",
      initials: "A & P",
      stars: 5,
      quote: "Lightning fast on mobile, ultra-luxurious typography, and the hidden Indie dog easter egg had everyone smiling. 10/10 recommend to every couple getting married!"
    },
    {
      names: "Varun & Sneha",
      city: "Chandigarh · Forest Hill",
      initials: "V & S",
      stars: 5,
      quote: "We were on a tight schedule, but they delivered our custom invite in under 36 hours! So easy to share on WhatsApp and track who's coming."
    },
    {
      names: "Dev & Ishita",
      city: "Ahmedabad · Belvedere Golf",
      initials: "D & I",
      stars: 5,
      quote: "No boring PDF cards that get lost in WhatsApp chats. Everyone loved the ambient sitar music, countdown timer, and seamless RSVP."
    }
  ];

  function renderMarquee() {
    const track = document.getElementById('testimonials-track');
    if (!track) return;

    // Duplicate dataset twice for seamless infinite CSS marquee scroll
    const fullList = [...testimonialsData, ...testimonialsData];

    track.innerHTML = fullList.map(item => `
      <div class="testimonial-card">
        <div class="testimonial-header">
          <div class="couple-avatar">${item.initials}</div>
          <div>
            <div class="couple-names">${item.names}</div>
            <div class="couple-city">${item.city}</div>
          </div>
        </div>
        <div class="testimonial-stars">${'★'.repeat(item.stars)}</div>
        <p class="testimonial-quote">“${item.quote}”</p>
      </div>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', renderMarquee);
})();
