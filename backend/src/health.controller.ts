import { Controller, Get } from "@nestjs/common";

// Endpoint de salud para Cloud Run / monitoreo.
@Controller("health")
export class HealthController {
  @Get()
  check() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }
}
