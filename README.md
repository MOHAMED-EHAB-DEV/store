# Premium Digital Assets Marketplace

## Project Overview
A state-of-the-art online marketplace for modern creators, designers, and web developers. The application is built using Next.js and React, styled dynamically with Tailwind CSS, animated with GreenSock Animation Platform and Lenis, and powered by a MongoDB database. It enables creators to browse, search, purchase, and download digital design templates and website components. Additionally, the project features a custom font subsetting service for optimizing font files down to minimal sizes, a real-time messaging system for user support, and a complete analytics and administration panel to manage the platform.

## Key Features Implemented

### User Interface and Dynamic Animations
- Fully responsive design using modern typography and layouts, utilizing CSS Grid and Flexbox layouts.
- Smooth scrolling effects using Lenis utility and complex layout animations orchestrated via the GreenSock Animation Platform.
- Dynamic page headers, categories grids, and interactive template details with optimized server-side rendering.

### Authentication and Access Control
- Custom token-based user authentication using JSON Web Tokens.
- Robust user registration, login, logout, and password recovery systems.
- Advanced middleware routing layer to protect sensitive dashboard and administration panels, redirecting unauthenticated or banned users.

### Product Catalog and Search Engine
- Structured catalog of digital templates divided into distinct categories like Figma designs, Framer templates, and coded website layouts.
- Dynamic search and filter endpoints to easily look up templates by keyword, price, or category.
- Purchase tracking system allowing users to buy templates, which links products directly to their profile for future access.

### Support and Real-Time Chat System
- Support ticket creation and tracking system for users to resolve inquiries.
- Real-time chat system powered by Socket.io client-server communication, allowing live interaction with support administrators.
- Online and offline status monitoring for both clients and support staff.

### Administration Panel
- Comprehensive dashboard tailored for administrators to oversee the entire platform.
- Tools to manage and edit template items, categories, and frequently asked questions.
- User management controls, including options to ban or unban accounts.
- Analytics console displaying user request metrics, page views, and client browser performance metrics.
- Monitoring screens for system errors and template download logs.

### Font Subsetting Service
- Separate, dedicated Node.js microservice built with Express for font file optimization.
- Parses user text to extract exactly the characters needed and strips unnecessary glyphs from uploaded TrueType, OpenType, and Web Open Font Format files.
- Leverages Harfbuzz WebAssembly engines or Python fonttools for processing.
- Supports files up to ten megabytes in size with automatic memory processing.

---

## Installation and Setup Guide

To get the application up and running on your local machine, follow the instructions described below.

### System Requirements
Before proceeding, ensure your environment contains Node.js version eighteen or newer. The application also supports the Bun runtime for faster execution. To enable advanced font subsetting features, an optional installation of Python three along with the Python font tools package is recommended.

### Getting the Code and Dependencies
First, download or clone the repository to your local machine. Navigate to the root directory of the project in your command terminal. Install all the necessary packages for the frontend application using your package manager's installation command.

Next, navigate into the font subsetting server subdirectory and perform a separate dependency installation command using Node or Bun.

### Environment Configuration
The application relies on configuration variables to connect with external services. Create a configuration file in the root directory named dot env. This file must contain the following keys and values:
- A database connection string pointing to your MongoDB instance.
- A secret string used for signing and verifying JSON Web Tokens.
- Cloudinary credentials including the cloud name, API key, and API secret to store product images.
- Google client identifier, client secret, refresh token, and drive folder identifier to handle template downloads from Google Drive.
- The public application URL pointing to your local server.
- The public socket URL pointing to the real-time server.
- An optional Google Tag Manager identifier and Google verification code for search engine optimization.

For the font subsetting microservice, create another dot env configuration file in its subfolder. Specify the port number on which the server should listen, with a default fallback to port three thousand.

### Running the Application

To launch the platform locally:

1. **Database Server**: Ensure your MongoDB server is active, either running as a local background daemon or hosted in the cloud.

2. **Real-Time Communication**: Start the standalone socket and proxy server to enable support chat connectivity.

3. **Frontend Application**: Run the development script from the project root using Bun or Node Package Manager. This will compile the assets and host the user interface on port three thousand. Open your browser and navigate to the local host address.

4. **Font Subsetting Service**: In the server subdirectory, execute the start script to boot the Express microservice. It will listen on the port you configured and expose the subsetting endpoints.
