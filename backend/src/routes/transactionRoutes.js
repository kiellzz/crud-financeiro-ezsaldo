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

  console.error(error); 

  res.status(500).json({
    message: "Erro ao criar transação"
  });

}

});

module.exports = router;

router.get("/", authMiddleware, async (req, res) => {

  try {

    const transactions = await Transaction.find({
      userId: req.userId
    }).sort({ date: -1 });

    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (t.type === "income") {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });

    const balance = income - expense;

    res.json({
      balance,
      income,
      expense,
      transactions
    });

  } catch (error) {

    res.status(500).json({
      message: "Erro ao buscar transações"
    });

  }

});

router.delete("/:id", authMiddleware, async (req, res) => {

  try {

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transação não encontrada"
      });
    }

    res.json({
      message: "Transação removida com sucesso"
    });

  } catch (error) {

    res.status(500).json({
      message: "Erro ao deletar transação"
    });

  }

});

router.put("/:id", authMiddleware, async (req, res) => {

  try {

    const { type, amount, description } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId
      },
      {
        type,
        amount,
        description
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transação não encontrada"
      });
    }

    res.json({
      message: "Transação atualizada",
      transaction
    });

  } catch (error) {

    res.status(500).json({
      message: "Erro ao atualizar transação"
    });

  }

});