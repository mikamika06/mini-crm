import { IsNotEmpty, IsNumber, IsDateString, IsInt } from 'class-validator';

export class CreateInvoiceDto {
  @IsNumber()
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsInt()
  clientId: number;
}
