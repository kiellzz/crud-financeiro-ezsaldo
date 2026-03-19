const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcryptjs");

router.post("/register", async (req, res) => {

  try {

    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: "Usuário criado com sucesso"
    });

  } catch (error) {

  console.error(error);

  res.status(500).json({
    message: "Erro no servidor"
  });

  }

});

module.exports = router;






const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email ou senha inválidos"
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Email ou senha inválidos"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login realizado",
      token,
      name: user.name
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Erro no servidor"
    });

  }

});