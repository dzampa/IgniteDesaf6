import request from "supertest";
import { Connection} from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create user Controller", () =>{
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

  it("should be able to authenticate an user", async ()=> {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "test"
    });

    expect(response.body).toHaveProperty("token");
  });

  it("should be not be able to authenticate an non existent user", async () =>{
      const response = await request(app).post("/api/v1/sessions").send({
        name: "test2",
        password: "test2"
      });
      expect(response.status).toBe(401);
  });

  it("should be not be able to authenticate an invalid password", async () =>{
        const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "test2"
    });
    expect(response.status).toBe(401);
  });

  it("should be not be able to authenticate an invalid password", async () =>{
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test1@test.com",
      password: "test"
    });
    expect(response.status).toBe(401);
  });

});
