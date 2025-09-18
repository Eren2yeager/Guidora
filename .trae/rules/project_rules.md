# 🚀 Always-Check Rules for Next.js (App Router) + MongoDB + Tailwind

These rules ensure the AI always generates **clean, bug-free, secure, and production-ready code** for this stack.

---

## 🔒 General Rules

1. **Never hardcode secrets**

   - Always use `process.env` (`.env.local`) for database URLs, API keys, and NextAuth secrets.
   - No credentials should appear in source code.

2. **Error Handling Everywhere**

   - Wrap all DB calls, async functions, and API handlers in `try/catch`.
   - Return structured errors in APIs:
     ```json
     { "success": false, "error": "message" }
     ```
   - Do not leak stack traces or sensitive details.

3. **Security**
   - Validate and sanitize all user inputs (`zod`, `validator.js`).
   - Prevent XSS (no unsafe `dangerouslySetInnerHTML`).
   - Only allow authenticated users to access protected routes.
   - Never trust client-sent IDs → always check against session user.

---

## 🎨 Frontend (Next.js + Tailwind)

1. **Components**

   - All reusable UI goes inside `/components`.
   - No duplicate UI code inside pages or server/client components.
   - Create universal components (`Button`, `Input`, `Modal`, `Card`).
   - Follow atomic design: page = layout + logic + small reusable components.

2. **App Router**

   - Keep route logic in `app/` folder.
   - Fetch data in **server components** (async + `await connectDB()`).
   - Use **client components** only for interactivity (forms, modals, buttons).

3. **Tailwind Usage**

   - No inline styles → always Tailwind classes.
   - Maintain readability (don’t overload class strings).
   - Follow responsive design (`sm:`, `md:`, `lg:` breakpoints).
   - Inputs, selects, and text must always be visible (e.g., `text-black` for input text).
    
4.  **Framer-motion** 
    - use frammer-motion for animations 
    - use `motion` components for smooth animations (`motion.div`, `motion.button`).
    - use `AnimatePresence` for exit animations.
    - use `variants` for complex animations.
    - use `initial`, `animate`, `exit` for basic animations.

5. **API Calls (Frontend)**
   - if you are going to use api in client side then you must check that api route understand that api carefully then make frontend api call accordingly ,
   - Use `fetch` with async/await.
   - Always handle loading + error states.
   - Example:
     ```js
     const res = await fetch("/api/songs");
     if (!res.ok) throw new Error("Failed to fetch songs");
     const data = await res.json();
     ```

---

## ⚙️ Backend (Next.js API Routes + MongoDB with Mongoose)

1. **Database Connection**

   - Always use a shared connection utility (`lib/mongodb.js`).
   - Never open multiple DB connections per request.
   - Example:

     ```js
     import mongoose from "mongoose";

     let isConnected = false;
     export async function connectDB() {
       if (isConnected) return;
       await mongoose.connect(process.env.MONGODB_URI);
       isConnected = true;
     }
     ```

2. **Mongoose Models**

   - Store all models in `/models`.
   - Use `_id` as `ObjectId`.
   - Use `ref` correctly for relations.
   - Example:
     ```js
     const UserSchema = new mongoose.Schema({
       email: { type: String, required: true, unique: true },
       playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Playlist" }],
     });
     ```

3. **API Route Handlers (`app/api/*/route.js`)**

   - Always `await connectDB()` before queries.
   - Use `try/catch`.
   - Return `{ success: true/false, data, error }`.
   - Example:

     ```js
     import connectDB from "@/lib/mongodb";
     import User from "@/models/User";

     export async function GET(req) {
       try {
         await connectDB();
         const users = await User.find();
         return Response.json({ success: true, data: users });
       } catch (err) {
         return Response.json(
           { success: false, error: "Internal Server Error" },
           { status: 500 }
         );
       }
     }
     ```

4. **Authentication & Authorization**
   - Use NextAuth.js for sessions.
   - In API routes, get session with `getServerSession(authOptions)`.
   - Restrict actions by role (user, artist, admin).

---

## 🛡️ Security Best Practices

- Hash passwords with **bcrypt** (if handling credentials).
- Always check user ID from session, not from `req.body`.
- Apply rate-limiting for login/OTP routes.
- Use Helmet headers if deploying with a custom server.

---

## 🚨 Golden Rules

- ❌ Never generate insecure, buggy, or incomplete code.
- ✅ Always return **clean, modular, reusable, and production-ready code**.
- ✅ Code must **work with Next.js App Router + MongoDB + Tailwind** without breaking structure.

---
