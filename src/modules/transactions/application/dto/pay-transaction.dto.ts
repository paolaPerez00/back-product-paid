import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class PayTransactionDto {
  @IsString()
  @IsNotEmpty()
  cardToken: string;

  @IsString()
  @IsNotEmpty()
  cardLast4: string;

  @IsIn(['VISA', 'MASTERCARD', 'UNKNOWN'])
  cardFranchise: 'VISA' | 'MASTERCARD' | 'UNKNOWN';
}
