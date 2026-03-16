require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

/* ROTAS */

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB conectado 🚀");
})
.catch((err) => {
  console.error("Erro ao conectar ao MongoDB:", err);
});

app.get("/", (req, res) => {
  res.json({ message: "API do EZSaldo funcionando 💰" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});