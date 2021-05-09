import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementTransfError } from "./CreateStatementTransfError";

interface IRequest {
  user_id: string;
}

interface IResponse {
    id: string;
    sender_id: string;
    amount: number;
    description: string;
  }

@injectable()
export class CreateStatementTransfUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ id, sender_id, amount, description }: IResponse) {
    const user = await this.usersRepository.findById(sender_id);

    if(!user) {
      throw new CreateStatementTransfError.SenderNotFound();
    }

    const receiver = await this.usersRepository.findById(id);

    if(!receiver) {
      throw new CreateStatementTransfError.ReceiverNotFound();
    }

    if (amount <= 0) {
      throw new CreateStatementTransfError.InvalidAmount()
    }

    const { balance } = await this.statementsRepository.getUserBalance({user_id: sender_id, with_statement: false});

    if (balance < amount) {
      throw new CreateStatementTransfError.InsufficientFunds()
    }

    const statementOperationSender = await this.statementsRepository.create({
      user_id: sender_id,
      sender_id,
      amount,
      description,
      type: OperationType.TRANSFER,
    });

    const statementOperationReceiver = await this.statementsRepository.create({
      user_id: id,
      sender_id,
      amount,
      description,
      type: OperationType.TRANSFER,
    });

    return statementOperationReceiver;
  }
}
