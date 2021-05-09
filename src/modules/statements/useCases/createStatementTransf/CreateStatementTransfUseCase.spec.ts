import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateStatementTransfError } from "./CreateStatementTransfError";
import { CreateStatementTransfUseCase } from "./CreateStatementTransfUseCase";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createStatementTransUseCase: CreateStatementTransfUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

let senderCreated: User;
let receiverCreated: User;

describe("Making Transf", () =>{
  beforeEach(async ()=>{
    inMemoryUserRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUserRepository,inMemoryStatementsRepository);
    createStatementTransUseCase = new CreateStatementTransfUseCase(inMemoryUserRepository, inMemoryStatementsRepository);

    const sender: ICreateUserDTO = {
      email: "ki@mekgogide.id",
      name: "Barry Perkins",
      password: "1234",
    };
    const receiver: ICreateUserDTO = {
      email: "zipza@wasvurih.ug",
      name: "Ethan Wright",
      password: "1234",
    };

    senderCreated = await createUserUseCase.execute(sender);
    receiverCreated = await createUserUseCase.execute(receiver);
  })
  it("should be able to create a transfer", async () => {

    const statement = await createStatementUseCase.execute({
      user_id: senderCreated.id,
      type: "deposit" as OperationType,
      amount: 10000,
      description: "deposit"
    });

    const transf = await createStatementTransUseCase.execute({
      sender_id: senderCreated.id,
      id: receiverCreated.id,
      amount: 1000,
      description: "transfer"
    });

    expect(transf).toHaveProperty("id");

  });
  it("should be not able to create a statement if sender not found", () => {
    expect(async () => {
      await createStatementTransUseCase.execute({
        sender_id: "error",
        id: receiverCreated.id,
        amount: 1000,
        description: "transfer"
      });
    }).rejects.toBeInstanceOf(CreateStatementTransfError.SenderNotFound);
  });
  it("should be not able to create a statement if receiver not found", () => {
    expect(async () => {
      await createStatementTransUseCase.execute({
        sender_id: senderCreated.id,
        id: "error",
        amount: 1000,
        description: "transfer"
      });
    }).rejects.toBeInstanceOf(CreateStatementTransfError.ReceiverNotFound);
  });
  it("should not be able to make a transf if sender have insufficient funds", () => {
    expect(async () => {
      await createStatementTransUseCase.execute({
        sender_id: senderCreated.id,
        id: receiverCreated.id,
        amount: 100000000,
        description: "transfer"
      });
    }).rejects.toBeInstanceOf(CreateStatementTransfError.InsufficientFunds);
  });
  it("should not be able to make a transf with invalid amount", () => {
    expect(async () => {
      await createStatementTransUseCase.execute({
        sender_id: senderCreated.id,
        id: receiverCreated.id,
        amount: 0,
        description: "transfer"
      });
    }).rejects.toBeInstanceOf(CreateStatementTransfError.InvalidAmount);
  });
})
