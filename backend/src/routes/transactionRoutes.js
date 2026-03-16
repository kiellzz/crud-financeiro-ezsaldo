const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {

  try {

    const { type, amount, description } = req.body;

    const transaction = new Transaction({
      userId: req.userId,
      type,
      amount,
      description
    });

    await transaction.save();

    res.status(201).json({
      message: "Transação adicionada",
      transaction
    });

  } catch (error) {

    res.status(500).json({
      message: "Erro ao criar transação"
    });

  }

});

module.exports = router;