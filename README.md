# 🏠 RentEase

🔗 **Live Demo:** https://rentease-zz2b.onrender.com

RentEase is a full-stack property rental platform where users can search, book, and manage rental properties, while property owners can list and manage their properties.

---

## 🚀 Features

### 👤 Customer

* Register & Login securely (bcrypt authentication)
* Search properties by:

  * Name / Location
  * Type
  * Price range
* View property details
* Book properties with date selection
* View upcoming & past bookings
* Cancel bookings
* Update profile

### 🏢 Owner

* Owner dashboard with stats
* Add new properties
* Edit & delete properties
* View bookings for owned properties
* Track revenue & booking insights
* Update profile

---

## 🛠️ Tech Stack

* **Frontend:** EJS, HTML, CSS
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (Supabase - Cloud)
* **Authentication:** bcrypt
* **Deployment:** Render

---

## 🗄️ Database Schema

* **Users**

  * id, fullname, username, password, role

* **Properties**

  * id, host_id, name, location, price, type, status
  * rooms, toilets, pools, parking

* **Bookings**

  * id, user_id, property_id, checkin, checkout

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Sparsh-kumar44/RentEase.git
cd RentEase
```

---

### 2️⃣ Install dependencies

```bash
npm install
```

---

### 3️⃣ Setup environment variables

Create a `.env` file:

```env
DB_HOST=your_supabase_host
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=postgres
```

---

### 4️⃣ Run the server

```bash
npm start
```

---

### 5️⃣ Open in browser

```
http://localhost:5000
```

---

## 🌐 Deployment

The project is deployed on **Render** with a cloud PostgreSQL database hosted on **Supabase**.

---

## 🔐 Security Notes

* Passwords are hashed using bcrypt
* Database credentials are stored in environment variables
* Avoid committing `.env` file to GitHub

---

## 📸 Screenshots
<img width="1919" height="900" alt="image" src="https://github.com/user-attachments/assets/49ff086c-1d4c-48e3-b86a-a0453fcd8d8e" />
<img width="1919" height="908" alt="image" src="https://github.com/user-attachments/assets/1c7d2db3-30b7-4a53-a3c4-9e670d384742" />
<img width="1916" height="905" alt="image" src="https://github.com/user-attachments/assets/b5b204e9-e42a-4571-843e-538e8bd30788" />
<img width="1919" height="849" alt="image" src="https://github.com/user-attachments/assets/cb948fd2-87ba-455d-a08c-31d5bf12d864" />


---

## 📌 Future Improvements

* Payment integration
* Image uploads for properties
* Advanced filtering & sorting
* Admin panel
* Notifications system

---

## 👨‍💻 Authors

* **Sparsh Kumar** — B.Tech CSE Student
* **Divakar Purohit** — B.Tech CSE Student

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
