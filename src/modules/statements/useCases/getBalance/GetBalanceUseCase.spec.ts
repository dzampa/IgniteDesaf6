import { rejects } from "node:assert";
import { type } from "node:os";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

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
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUserRepository);
  })
  it("should be able to get a list of user's balance", async () => {
    const user: ICreateUserDTO = {
      email: "test@test.com",
      name: "test",
      password: "1324",
    };

    const userCreated = await createUserUseCase.execute(user);

    await createStatementUseCase.execute({
      user_id: userCreated.id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "deposit",
    });

    await createStatementUseCase.execute({
      user_id: userCreated.id,
      type: "withdraw" as OperationType,
      amount: 10,
      description: "withdraw",
    });

    const balance = await getBalanceUseCase.execute({user_id: userCreated.id});

    expect(balance).toHaveProperty("balance");

  });

  it("should be not able to get a list of user's balance not registered", () => {
    expect(async () => {
      await getBalanceUseCase.execute({user_id: "error"});
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
