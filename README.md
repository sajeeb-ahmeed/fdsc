# Friends Dream Society (MERN Upgrade)

This project has been upgraded from a mock-data Vite app to a full MERN stack (MongoDB, Express, Node.js, React).

## 🚀 Quick Start (Localhost)

Follow these steps to get the application running on your machine.

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local or MongoDB Atlas)

---

### 2. Backend Setup (`/server`)

1. Open a terminal and go to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the `server` folder:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/friends-dream
   JWT_SECRET=your_secret_key_here
   ```

4. **Seed the Database** (Important for first-time setup):
   Run the seed script to create the admin user and initial settings:
   ```bash
   npm run seed
   ```

5. Start the Backend:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

---

### 3. Frontend Setup (Root Directory)

1. Open a **new terminal** in the root directory.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Frontend:
   ```bash
   npm run dev
   ```
   The app will typically run on `http://localhost:5173`.

---

### 4. Initial Login Credentials

Use these credentials to log in after seeding the database:
- **Username**: `admin`
- **Password**: `admin123`

---

## 🛠️ Project Features
- **Immutable Ledger**: All transactions are recorded in a financial ledger for audit accuracy.
- **Inventory-Linked Financing**: Products from stock can be sold on credit with automated repayment schedules.
- **Dividend Engine**: Fair profit distribution based on 'share-days'.
- **Directorship Rules**: Enforces minimum share requirements for board members.

## 📁 Directory Structure
- `/src`: React Frontend (Vite)
- `/server`: Node.js/Express Backend
- `/server/models`: Mongoose Schemas
- `/server/routes`: API endpoints
- `/server/utils`: Dividend calculation and token generation logic
