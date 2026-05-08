process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");

let mongod;
let token;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Registra e loga um usuário para obter o token
  await request(app).post("/api/auth/register").send({
    name: "Test User",
    email: "test@example.com",
    password: "123456",
  });

  const res = await request(app).post("/api/auth/login").send({
    email: "test@example.com",
    password: "123456",
  });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("Transactions — POST /api/transactions", () => {
  it("deve criar uma transação com sucesso", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "income",
        amount: 100,
        description: "Salário",
        date: "2026-05-01",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("transaction");
    expect(res.body.transaction.amount).toBe(100);
  });

  it("deve rejeitar valor zero ou negativo", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "expense",
        amount: -50,
        description: "Inválido",
        date: "2026-05-01",
      });

    expect(res.statusCode).toBe(400);
  });

  it("deve rejeitar data anterior a 2026", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "expense",
        amount: 50,
        description: "Antiga",
        date: "2025-12-31",
      });

    expect(res.statusCode).toBe(400);
  });

  it("deve rejeitar requisição sem token", async () => {
    const res = await request(app).post("/api/transactions").send({
      type: "income",
      amount: 100,
      description: "Sem auth",
      date: "2026-05-01",
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("Transactions — GET /api/transactions", () => {
  beforeEach(async () => {
    await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "income", amount: 200, description: "Entrada", date: "2026-05-01" });

    await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "expense", amount: 50, description: "Saída", date: "2026-05-02" });
  });

  it("deve retornar transações com balance, income e expense", async () => {
    const res = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("transactions");
    expect(res.body).toHaveProperty("balance");
    expect(res.body.income).toBe(200);
    expect(res.body.expense).toBe(50);
    expect(res.body.balance).toBe(150);
  });
});

describe("Transactions — DELETE /api/transactions/:id", () => {
  it("deve deletar uma transação existente", async () => {
    const created = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "income", amount: 100, description: "Para deletar", date: "2026-05-01" });

    const id = created.body.transaction._id;

    const res = await request(app)
      .delete(`/api/transactions/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("deve retornar 404 para transação inexistente", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/transactions/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});

describe("Transactions — PUT /api/transactions/:id", () => {
  it("deve atualizar uma transação existente", async () => {
    const created = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "income", amount: 100, description: "Original", date: "2026-05-01" });

    const id = created.body.transaction._id;

    const res = await request(app)
      .put(`/api/transactions/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "income", amount: 300, description: "Atualizado", date: "2026-05-01" });

    expect(res.statusCode).toBe(200);
    expect(res.body.transaction.amount).toBe(300);
    expect(res.body.transaction.description).toBe("Atualizado");
  });

  it("deve rejeitar atualização com valor inválido", async () => {
    const created = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "income", amount: 100, description: "Original", date: "2026-05-01" });

    const id = created.body.transaction._id;

    const res = await request(app)
      .put(`/api/transactions/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "income", amount: 0, description: "Inválido", date: "2026-05-01" });

    expect(res.statusCode).toBe(400);
  });
});