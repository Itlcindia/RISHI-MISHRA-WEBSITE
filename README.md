src
├── ai
│   ├── dev.ts
│   └── genkit.ts
├── app
│   ├── about
│   │   └── page.tsx
│   ├── admin
│   │   ├── events
│   │   ├── gallery
│   │   ├── hero
│   │   ├── initiatives
│   │   ├── login
│   │   ├── messages-viewer.tsx
│   │   ├── news
│   │   └── page.tsx
│   ├── contact
│   │   └── page.tsx
│   ├── events
│   │   ├── [id]
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── gallery
│   │   └── page.tsx
│   ├── globals.css
│   ├── initiatives
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── news
│   │   ├── [id]
│   │   └── page.tsx
│   └── page.tsx
├── components
│   ├── FirebaseErrorListener.tsx
│   ├── admin
│   │   ├── event-form.tsx
│   │   ├── events-manager.tsx
│   │   ├── gallery-form.tsx
│   │   ├── gallery-manager.tsx
│   │   ├── hero-form.tsx
│   │   ├── hero-manager.tsx
│   │   ├── initiative-form.tsx
│   │   └── initiatives-manager.tsx
│   ├── animated-text.tsx
│   ├── animations.tsx
│   ├── language-switcher.tsx
│   ├── layout
│   │   ├── footer.tsx
│   │   └── header.tsx
│   ├── logo.tsx
│   ├── news
│   │   ├── news-form.tsx
│   │   └── news-manager.tsx
│   ├── saffron-stripe.tsx
│   ├── ui
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx
│   │   ├── chart.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── menubar.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── radio-group.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── tooltip.tsx
│   ├── upcoming-events.tsx
│   └── whatsapp-fab.tsx
├── content
│   ├── events.ts
│   ├── news.ts
│   └── translations.ts
├── context
│   └── language-context.tsx
├── firebase
│   ├── auth
│   │   ├── auth.ts
│   │   └── use-user.ts
│   ├── client-provider.tsx
│   ├── config.ts
│   ├── error-emitter.ts
│   ├── errors.ts
│   ├── firestore
│   │   ├── use-collection.tsx
│   │   └── use-doc.tsx
│   ├── index.ts
│   ├── non-blocking-login.tsx
│   ├── non-blocking-updates.tsx
│   └── provider.tsx
├── hooks
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   └── use-translation.ts
├── lib
│   ├── api.ts
│   ├── placeholder-images.json
│   ├── placeholder-images.ts
│   └── utils.ts
└── models
    ├── event.ts
    ├── galleryImage.ts
    ├── heroImage.ts
    ├── initiative.ts
    └── news.ts