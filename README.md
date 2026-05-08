f> ⚠️ **Project Status:** In development (currently running locally)

# 💰 EZSaldo • Financial Web App

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**EZSaldo** is a financial management web application built with a strong focus on **clarity, organization, and user experience**.

The system allows users to manage income and expenses, track balance in real time, and visualize financial evolution through a modern and interactive dashboard.

---

## 🎯 Project Goal

This project was built to:

- Simulate a real-world financial system  
- Practice fullstack development (frontend + backend)  
- Apply UX/UI concepts in a functional product  

---

## 📸 Preview

A modern interface focused on user experience:

### 🔐 Login Screen
![Login](./media/login.png)

### 📊 Financial Dashboard
![Dashboard](./media/dashboard.png)

### 👤 Profile Editing
![Edit User](./media/edituser.png)

### ✂️ Avatar Cropping
![Crop](./media/crop.png)

---

## 🛠 Tech Stack

### 🔹 Frontend
- HTML5  
- CSS3  
- Vanilla JavaScript  
- Responsive interface  
- Visual feedback (loaders, states, modals)  

### 🔹 Backend
- Node.js  
- Express  
- MongoDB (Atlas)  
- Mongoose  
- JWT (authentication)  
- bcrypt (password hashing)  

---

## 🚀 Features

- 🔐 **Secure Authentication**
  - Register and login with hashed passwords  
  - JWT-based authentication  

- 💰 **Transaction Management**
  - Add income and expenses  
  - Edit and delete records  

- 📊 **Dynamic Dashboard**
  - Real-time balance updates  
  - Visual differentiation (income vs expenses)  
  - Balance evolution chart  

- 📅 **Date Filters**
  - View data by time range (7 days, 30 days)  

- 🎨 **User Experience**
  - Confirmation modals (delete/logout)  
  - Visual feedback for actions  
  - Loading states during requests  
  - Clean and modern interface  

---

## 🧩 Highlights

- Interface inspired by real fintech applications  
- Strong focus on **usability and visual feedback**  
- Clean architecture (separated frontend & backend)  
- Built as a **product**, not just a CRUD  

---

## 🖥️ Project Structure

```text
CrudFinanceiro/
├─ backend/
│  ├─ src/
│  │  ├─ middleware/
│  │  │  └─ authMiddleware.js
│  │  ├─ models/
│  │  │  ├─ Transaction.js
│  │  │  └─ User.js
│  │  ├─ routes/
│  │  │  ├─ authRoutes.js
│  │  │  └─ transactionRoutes.js
│  │  └─ server.js
│  ├─ .env.example
│  ├─ package-lock.json
│  └─ package.json
│
├─ frontend/
│  ├─ assets/
│  ├─ auth.js
│  ├─ chart.js
│  ├─ cropImage.js
│  ├─ dashboard.css
│  ├─ dashboard.html
│  ├─ dashboard.js
│  ├─ editUser.css
│  ├─ editUser.html
│  ├─ editUser.js
│  ├─ login.html
│  ├─ register.html
│  └─ style.css
│
├─ media/
│  ├─ login.png
│  ├─ dashboard.png
│  ├─ edituser.png
│  └─ crop.png
│
└─ README.md
````

---

## ⚙️ Running Locally

### 1. Clone the repository

```bash id="cloneez"
git clone https://github.com/kiellzz/financial-tracker.git
cd financial-tracker
```

---

### 2. Backend Setup

```bash id="installez"
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the server:

```bash id="startez"
cd backend/src
node server.js
```

> 📍 Backend running at: [http://localhost:5000](http://localhost:5000)

---

### 3. Run Frontend

* Open `login.html` in your browser
  or
* Use **Live Server** in VS Code

---

## 📌 Future Improvements

* 📊 Financial insights and analytics
* 🧠 Expense categorization
* 📱 Better mobile responsiveness
* ☁️ Full deployment (frontend + backend)

---

## 👨‍💻 Author

Developed by **Ezequiel Borges**

* GitHub: [https://github.com/kiellzz](https://github.com/kiellzz)
* LinkedIn: [https://www.linkedin.com/in/ezequielborgesdev](https://www.linkedin.com/in/ezequielborgesdev)

---

## ⭐ Final Notes

This project represents my growth as a developer, focusing on building applications that deliver not only functionality, but also **clarity, usability, and user experience**.
