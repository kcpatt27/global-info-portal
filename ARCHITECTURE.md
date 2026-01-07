# Global Information Portal Architecture

## System Overview
Users load in to an interactive map showing the world with countries outlined. When clicked their data is show in panel. Theres no database, no api calls (outside of pulling json from github) and no frontend framework (outside of webpack and babel)

Example: "Users submit recipes through the web interface. The backend stores them in PostgreSQL and makes them searchable via Elasticsearch. The recommendation engine analyzes user behavior and suggests recipes."

## Architecture Diagram

```
┌─────────────┐
│   Browser   │  User accesses web app
└──────┬──────┘
       │ HTTPS
┌──────▼──────┐
│  Frontend   │  React app - recipe search, creation, user profile
│  (React)    │
└──────┬──────┘
       │ REST API (JSON)
┌──────▼──────────────┐
│   Backend API       │  Node.js/Express - handles recipe CRUD,
│  (Node.js/Express)  │  authentication, recommendations
└──────┬──────────────┘
       │
┌──────▼──────┐
│ PostgreSQL  │  Stores recipes, users, bookmarks, interactions
│  Database   │
└─────────────┘
```

## Key Components

### Frontend (React)
- **Purpose:** User interface for recipes
- **Technology:** React 18 + TypeScript
- **Hosted on:** [Vercel / AWS / Your hosting]
- **Key Features:** 
  - Recipe search
  - Recipe creation/editing
  - User dashboard

### Backend API (Node.js/Express)
- **Purpose:** Handle business logic, database access, recommendations
- **Technology:** Node.js v18 + Express + [Other libraries]
- **Hosted on:** [Heroku / AWS / Your hosting]
- **Key Endpoints:**
  - `GET /recipes` — Search/list recipes
  - `POST /recipes` — Create recipe
  - `GET /users/:id/recommendations` — Get personalized recommendations

### Database (PostgreSQL)
- **Purpose:** Persist all data (recipes, users, interactions)
- **Key Tables:**
  - `users` — User accounts
  - `recipes` — Recipe data
  - `bookmarks` — Saved recipes per user
  - `interactions` — Likes, views for recommendations
- **See:** [SCHEMA.md] for detailed schema

### External Services
- **GitHub API:** [What you use it for]
- **Stripe:** [If using for payments]
- **SendGrid:** [If using for emails]

## Data Flow

### Creating a Recipe
1. User fills out recipe form in React frontend
2. Frontend sends POST request to `/recipes` API endpoint
3. Backend validates recipe data
4. Backend stores recipe in PostgreSQL
5. Backend returns recipe ID and confirmation to frontend
6. Frontend shows success message

### Getting Recommendations
1. User visits recommendations page
2. Frontend requests `GET /recommendations`
3. Backend queries user interaction history
4. Backend runs recommendation algorithm
5. Backend returns 10 recommended recipes
6. Frontend displays recipes with images and descriptions

## Technology Decisions

### Why PostgreSQL?
- We need ACID compliance (data integrity matters more than horizontal scaling)
- Relational data model (recipes, users, bookmarks fit natural relationships)
- Strong ecosystem and good Node.js drivers

### Why React?
- Need real-time search as users type (not traditional page navigation)
- Interactive recipe creation and editing
- Large ecosystem for UI components

### Why Node.js/Express?
- JavaScript across the stack (frontend and backend)
- Good performance for I/O-bound operations (API calls, database queries)
- Large npm ecosystem for recipes/food domain libraries

## Scalability

### Current Capacity
- [X] recipes supported
- [Y] concurrent users
- API response time: [Zms] median

### Scaling Strategy
1. **Cache layer:** Redis for recipe search results
2. **Database:** PostgreSQL replication for read scaling
3. **Frontend:** CDN distribution via Vercel
4. **API:** Horizontal scaling with load balancer (future)

## Known Limitations
- [Limitation 1] — Will address in v2 when [condition]
- [Limitation 2] — Currently acceptable because [reason]

## Next Steps
See [ROADMAP.md](ROADMAP.md) for planned improvements to architecture.
