import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "./config/env.validation";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProductsModule } from "./products/products.module";
import { CategoriesModule } from "./categories/categories.module";
import { CollectionsModule } from "./collections/collections.module";
import { SizesModule } from "./sizes/sizes.module";
import { ColorsModule } from "./colors/colors.module";
import { BannersModule } from "./banners/banners.module";
import { ContentModule } from "./content/content.module";
import { OrdersModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";
import { UploadsModule } from "./uploads/uploads.module";
import { WishlistModule } from "./wishlist/wishlist.module";
import { DiscountsModule } from "./discounts/discounts.module";
import { MailModule } from "./mail/mail.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CollectionsModule,
    SizesModule,
    ColorsModule,
    BannersModule,
    ContentModule,
    OrdersModule,
    PaymentsModule,
    UploadsModule,
    WishlistModule,
    DiscountsModule,
    MailModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
