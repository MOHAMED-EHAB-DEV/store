// This file configures the initialization of Sentry on the (auth).
// The config you add here will be used whenever the (auth) handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://5ca4feb2758dbdef1c81669323941ac3@o4507827513065472.ingest.de.sentry.io/4509707963727952",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
