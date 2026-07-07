import { Global, Module } from "@nestjs/common";
import { MailService } from "./mail.service";

// Global para que Auth y Orders puedan inyectarlo sin re-importar.
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
