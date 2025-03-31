# Drone Survey Management System

A full-stack application for planning, managing, and monitoring autonomous drone surveys across global facilities.

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [System Architecture](#system-architecture)
- [AI Tools Used](#ai-tools-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Design Decisions](#design-decisions)
- [Safety Considerations](#safety-considerations)
- [Future Improvements](#future-improvements)

## Features

### Mission Planning System
- Define survey areas with polygonal selection on interactive maps
- Configure flight paths with waypoints and altitudes
- Set sensor parameters and capture intervals
- Schedule one-time or recurring missions

### Fleet Management Dashboard
- View organization-wide drone inventory
- Monitor real-time drone status (available, in-mission, maintenance)
- Track battery levels and health metrics

### Mission Monitoring Interface
- Real-time flight path visualization
- Mission progress tracking (% complete, ETA)
- Control actions (pause, resume, abort)

### Survey Reporting Portal
- Detailed mission summaries
- Flight statistics (duration, distance, coverage)
- Organization-wide analytics

## Technologies

### Frontend
- React/Next.js (TypeScript)
- Leaflet.js for map visualization
- Tailwind CSS for styling
- WebSocket for real-time updates

### Backend
- Next.js API routes
- PostgreSQL with PostGIS extension
- Prisma ORM

### Infrastructure
- Vercel for deployment
- PostgreSQL hosted on Vercel
- WebSocket server for real-time communication

## System Architecture

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
