import { Global, Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";

// Global para que Orders pueda inyectarlo sin re-importar.
@Global()
@Module({
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
