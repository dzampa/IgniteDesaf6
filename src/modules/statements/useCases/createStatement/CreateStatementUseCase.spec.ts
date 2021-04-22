import { rejects } from "node:assert";
import { type } from "node:os";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Balance", () =>{
  beforeEach(()=>{
    inMemoryUserRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(inMemoryUserRepository,inMemoryStatementsRepository)
  })
  it("should be able to create a statement", async () => {
    const user: ICreateUserDTO = {
      email: "test@test.com",
      name: "test",
      password: "1324",
    };

    const userCreated = await createUserUseCase.execute(user);

    const statement = await createStatementUseCase.execute({
      user_id: userCreated.id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "deposit",
    });

    expect(statement).toHaveProperty("id");

  });

  it("should be not able to create a statement if user not found", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "error",
        type: "deposit" as OperationType,
        amount: 100,
        description: "deposit",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });


  it("should not be able to create a statement of withdraw if have insufficient funds", async () => {
    const user: ICreateUserDTO = {
      email: "test@test.com",
      name: "test",
      password: "1324",
    };

    const userCreated = await createUserUseCase.execute(user);

    expect(async ()=>{
      await createStatementUseCase.execute({
      user_id: userCreated.id,
      type: "withdraw" as OperationType,
        amount: 100,
        description: "withdraw",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);

  });

});
