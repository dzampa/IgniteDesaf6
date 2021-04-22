import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Statement Operations", () =>{
  beforeEach(()=>{
    inMemoryUserRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(inMemoryUserRepository,inMemoryStatementsRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUserRepository,inMemoryStatementsRepository);
  });
  it("Should be able to get a statement operation", async() =>{
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

    const ret = await getStatementOperationUseCase.execute({
      user_id: userCreated.id,
      statement_id: statement.id,
    });

    expect(ret).toHaveProperty("id");

  });
  it("Should not be able to get a statement operation an user not found", async() =>{
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

    expect(async()=>{
      await getStatementOperationUseCase.execute({
        user_id: "error",
        statement_id: statement.id,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);

  });
  it("Should not be able to get a statement operation an statement not found", async() =>{
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

    expect(async()=>{
      await getStatementOperationUseCase.execute({
        user_id: userCreated.id,
        statement_id: "error",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);

  });
})
