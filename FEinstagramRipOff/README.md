# InstagramRipOff – Frontend

Angular 19 single-page app for [InstagramRipOff](../README.md). It expects the API on `http://localhost:8080`.

```bash
npm install
npm start            # dev server on http://localhost:4200
npm test             # unit tests (Karma)
npx cypress open     # E2E tests (backend and dev server must be running)
```

Structure of `src/app/`:

| Folder | Contents |
|---|---|
| `components/` | Login, signup, post feed / details / creation, comments, profile, admin dashboard |
| `services/` | HTTP clients for auth, posts, comments, tags, votes and users |
| `guards/`, `interceptors/` | Route guard for authenticated pages; interceptor that attaches the JWT |
| `models/` | TypeScript interfaces mirroring the backend entities |
