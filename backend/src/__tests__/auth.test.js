require("dotenv").config();

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
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

describe("Auth — registro", () => {
  it("deve registrar um novo usuário", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");
  });

  it("não deve registrar e-mail duplicado", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "dup@example.com",
      password: "123456",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Test User 2",
      email: "dup@example.com",
      password: "abcdef",
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("Auth — login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Login User",
      email: "login@example.com",
      password: "senha123",
    });
  });

  it("deve logar com credenciais corretas", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "senha123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("deve rejeitar senha incorreta", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "errada",
    });

    expect(res.statusCode).toBe(400);
  });
});