import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create Statement Controller", ()=>{
  beforeAll(async () =>{
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@test.com",
      password: "test"
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new deposit", async ()=>{
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "test"
    });

    const {token} = responseToken.body;

    const response = await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 100,
      description: "deposit",
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");

  });

  it("should not be able to create a new statement with invalid token", async ()=>{

    const response = await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 100,
      description: "deposit",
    })
    .set({
      Authorization: `Bearer token`,
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");

  });

  it("should be able to create a new with draw", async ()=>{
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "test"
    });

    const {token} = responseToken.body;

    const response = await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 90,
      description: "withdraw",
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");

  });

  it("should not be able to create a statement of withdraw if have insufficient funds", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "test"
    });

    const {token} = responseToken.body;

    const response = await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 200,
      description: "withdraw",
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");

  });
});
