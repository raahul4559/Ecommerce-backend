# 🛒 Ecommerce Backend API

A robust and scalable RESTful API for an E-commerce application built with **Node.js**, **Express.js**, and **MongoDB**. This backend provides authentication, product management, order processing, and other essential features required for an online shopping platform.

---

## 🚀 Features

- 🔐 User Authentication (JWT)
- 👤 User Registration & Login
- 🛍️ Product Management (CRUD)
- 📦 Category Management
- 🛒 Shopping Cart API
- 💳 Order Management
- 📄 Pagination & Search
- 🔍 Product Filtering
- 🛡️ Protected Routes
- ⚡ Error Handling Middleware
- 🌐 RESTful API Architecture

---

## 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **JWT (JSON Web Token)**
- **bcrypt**
- **dotenv**
- **Cors**

---

## 📂 Project Structure

```
Ecommerce-backend/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── uploads/
├── .env
├── server.js
├── package.json
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/raahul4559/Ecommerce-backend.git
```

### 2. Navigate to the Project

```bash
cd Ecommerce-backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 5. Start the Server

Development Mode

```bash
npm run dev
```

Production Mode

```bash
npm start
```

---

## 📌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Register User |
| POST | /api/auth/login | Login User |

### Products

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/products | Get All Products |
| GET | /api/products/:id | Get Product by ID |
| POST | /api/products | Create Product |
| PUT | /api/products/:id | Update Product |
| DELETE | /api/products/:id | Delete Product |

### Orders

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/orders | Create Order |
| GET | /api/orders | Get User Orders |

---

## 📷 API Testing

You can test the API using:

- Postman
- Thunder Client
- Insomnia

---

## 🔒 Authentication

Protected routes require a JWT token.

Example:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📦 Dependencies

```json
Express
MongoDB
Mongoose
JWT
bcrypt
dotenv
cors
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push the branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Rahul Gupta**

GitHub: https://github.com/raahul4559

---

⭐ If you found this project useful, don't forget to star the repository!
