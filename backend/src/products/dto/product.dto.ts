import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class VariantDto {
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() colorHex?: string;
  @IsOptional() @IsNumber() priceOverrideUsd?: number;
  @IsNumber() stock!: number;
}

export class ImageDto {
  @IsString() url!: string;
  @IsOptional() @IsString() altEs?: string;
  @IsOptional() @IsString() altEn?: string;
}

export class CreateProductDto {
  @IsString() slug!: string;
  @IsString() nameEs!: string;
  @IsString() nameEn!: string;
  @IsOptional() @IsString() descriptionEs?: string;
  @IsOptional() @IsString() descriptionEn?: string;
  @IsNumber() priceUsd!: number;
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsString() categoryId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images?: ImageDto[];
}

export class UpdateProductDto extends CreateProductDto {}
