import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class OrderItemDto {
  @IsString() variantId!: string;
  @IsInt() @Min(1) quantity!: number;
}

export class CardDto {
  @IsString() number!: string;
  @IsString() exp!: string;
  @IsString() cvc!: string;
}

export class CreateOrderDto {
  @IsOptional() @IsEmail() guestEmail?: string;
  @IsString() shippingName!: string;
  @IsString() shippingAddress!: string;
  @IsString() shippingPhone!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ValidateNested()
  @Type(() => CardDto)
  card!: CardDto;
}
