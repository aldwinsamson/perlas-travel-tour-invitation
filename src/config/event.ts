import type { EventConfig, EventStatusSetting } from '../types';

const env = import.meta.env;

export const eventConfig: EventConfig = {
  agency: {
    name: 'Perlas Travel & Tours',
    wordmark: 'PERLAS PH.',
    tagline: 'Every Journey, A Story Worth Telling',
  },
  event: {
    title: 'Grand Opening & Ribbon Cutting Ceremony',
    titleScript: ['Grand Opening', 'Ribbon Cutting Ceremony'],
    hashtags: ['#TogetherWithPerlas', '#TravelWithPerlas'],
  },
  when: {
    localStart: '2026-11-27T10:00:00',
    timezone: 'Asia/Manila',
    utcOffset: '+08:00',
    displayDate: 'November 27, 2026',
    displayTime: '10:00 AM',
    assumedDurationMinutes: 120,
  },
  venue: {
    name: 'Intramuros Corporate Plaza',
    room: 'Room 209',
    area: 'Intramuros, Manila',
    mapsUrl: env.VITE_GOOGLE_MAPS_URL ?? '',
    mapsQuery: 'Intramuros Corporate Plaza, Intramuros, Manila',
    mapsEmbedAllowed: true,
  },
  host: {
    name: 'Princess Elaine A. Tan',
    role: 'Founder and Owner',
    photo: '/images/owner-portrait.webp',
    bio: null,
  },
  invitation: {
    image: '/images/invitation.webp',
    file: '/downloads/perlas-invitation.png',
    alt: 'Official invitation to the grand opening and ribbon cutting ceremony of Perlas Travel & Tours',
  },
  copy: {
    inviteLead: 'You are cordially invited to our',
    inviteMessage:
      'Join us as we celebrate the official opening of Perlas Travel & Tours and begin on a new journey together, in the heart of historic Intramuros.',
    about: {
      heading: 'A New Chapter Begins.',
      paragraphs: [
        'Every great journey starts with a single step. As Perlas Travel & Tours officially opens its doors, we celebrate a new chapter filled with possibilities, meaningful connections, and unforgettable journeys.',
        'Join us as we mark this special milestone and begin a journey dedicated to exploring, discovering, and creating stories worth telling.',
      ],
    },
    countdown: {
      before: 'Until We Begin Our Journey.',
      today: 'The Journey Begins Today!',
      after: 'Thank You for Celebrating With Us!',
    },
    rsvp: {
      heading: 'Your Presence Makes This Journey Special.',
      body: 'Be part of a memorable beginning. We would be delighted to celebrate this special occasion with you.',
      button: 'CONFIRM YOUR ATTENDANCE',
    },
    closing: 'Let\u2019s Explore, Discover, and Create More Journeys Together!',
  },
  program: {
    tentative: true,
    items: [
      { title: 'Guest Arrival' },
      { title: 'Welcome Remarks' },
      { title: 'Opening Ceremony' },
      { title: 'Ribbon Cutting Ceremony' },
      { title: 'Message from the Founder and Owner' },
      { title: 'Photo Opportunity' },
      { title: 'Celebration and Fellowship' },
    ],
  },
  rsvp: {
    formUrl: env.VITE_GOOGLE_FORM_URL ?? '',
    embedUrl: env.VITE_GOOGLE_FORM_EMBED_URL ?? '',
    privacy: [
      'Your RSVP is collected by Google Forms and goes only to the Perlas Travel & Tours team.',
      'We do not share your information with any third parties.',
      'This website does not store or track your answers. Google processes the form under its own privacy policy.',
    ],
  },
  contact: {
    email: '',
    phone: '',
    socials: [
      { id: 'facebook', label: 'Facebook', url: env.VITE_FACEBOOK_URL ?? '' },
      { id: 'instagram', label: 'Instagram', url: env.VITE_INSTAGRAM_URL ?? '' },
    ],
  },
  social: { follow: 'Follow the journey' },
  status: ((env.VITE_EVENT_STATUS as EventStatusSetting | undefined) ?? 'auto'),
  intro: { enabled: true, mobileBreakpoint: 768, failsafeSeconds: 30 },
};
