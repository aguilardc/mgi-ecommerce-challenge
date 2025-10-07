# eCommerce Chanllenge

## Arquitectura de Microservicios

                              ┌─────────────────────────────────┐
                              │         API Gateway             │
                              │      (NestJS / Express)         │
                              └────────┬───────────────┬────────┘
                                       │               │
                    ┌──────────────────┴───┐    ┌─────▼──────────────────┐
                    │                      │    │                        │
         ┌──────────▼──────────┐  ┌────────▼────────┐  ┌────────────────▼────────┐
         │  Order Service      │  │ Inventory Svc   │  │  Tracking Service       │
         │  (NestJS/Laravel)   │  │ (NestJS/Laravel)│  │  (NestJS/Laravel)       │
         └──────┬──────────────┘  └────────┬────────┘  └───────────┬──────────────┘
                │                          │                       │
                │                          │                       │
                │                          │                       │
         ┌──────▼──────────────────────────▼───────────────────────▼──────────┐
         │                    Message Broker (Opcional)                        │
         │                  (RabbitMQ / AWS SQS / EventBridge)                 │
         └─────────────────────────────────────────────────────────────────────┘
                │                          │                       │
                │                          │                       │
         ┌──────▼──────────┐      ┌────────▼────────┐    ┌────────▼──────────┐
         │   PostgreSQL    │      │   PostgreSQL    │    │   PostgreSQL      │
         │  Orders DB      │      │  Inventory DB   │    │   Tracking DB     │
         └─────────────────┘      └─────────────────┘    └───────────────────┘

## Arquitectura

- Microservicios: Order, Inventory, Tracking
- Patrón SAGA para transacciones distribuidas
- 3 estrategias de locking concurrente

## SOLID Principles

### Single Responsibility

- Order Service: Solo gestion de órdenes
- Inventory Service: Solo gestión de stock
- Tracking Service: Solo auditoría

### Open/Closed

- Estrategias de locking intercambiables vía query param
- Nuevas estrategias sin modificar código existente

### Liskov Substitution

- Todas las estrategias implementan ILockStrategy
- Intercambiables sin romper contratos

### Interface Segregation

- Interfaces específicas por servicio
- Sin dependencias innecesarias

### Dependency Inversion

- Servicios dependen de abstracciones (interfaces)
- Inyección de dependencias vía DI container

## Instalación

```bash
git clone https://github.com/aguilardc/mgi-ecommerce-challenge
cd mgi-ecommerce-challenge

docker compose up --build
```

## Ejecutar Tests

Para ejecutar los test hay que ingresar en el directorio por ejemplo inventory-service

```bash
cd inventory-service

yarn test
yarn test test/unit
yarn test test/integration
```

## Comandos Artillery para Load Testing

```bash
# Instalar Artillery globalmente
npm install -g artillery@latest

# O con yarn
yarn global add artillery

```

🚀 Ejecutar Tests

Test básico (todas las estrategias)

```bash
cd inventory-service
artillery run test/load/load-test.artillery.yml
```

Test con estrategia específica

```bash
# Solo PESSIMISTIC
artillery run test/load/load-test.artillery.yml \
  --variables '{"lockingStrategy": "PESSIMISTIC"}'

# Solo OPTIMISTIC
artillery run test/load/load-test.artillery.yml \
  --variables '{"lockingStrategy": "OPTIMISTIC"}'

# Solo APPLICATION
artillery run test/load/load-test.artillery.yml \
  --variables '{"lockingStrategy": "APPLICATION"}'
```

Test con reporte

```bash
artillery run test/load/load-test.artillery.yml --record --key [su-key]
```

* para obtener una [key] ir a https://app.artillery.io/ y registrarse
* después de ejecutar el comando anterior podra ver los resultados en el dashboard de su cuenta en la web de artillery

Test con más usuarios (escalado)

```bash
# 50 usuarios para race condition, 100 para concurrencia
artillery run test/load/load-test.artillery.yml \
  --overrides '{"config": {"phases": [{"duration": 10, "arrivalCount": 50}, {"pause": 5}, {"duration": 15, "arrivalCount": 100}]}}'
```

### 📊 Interpretar Resultados

Artillery mostrará:

```json
Summary report @ 15:30:45(+0000)
  Scenarios launched:  35
  Scenarios completed: 35
  Requests completed:  70
  Mean response/sec: 4.67
  Response time (msec):
    min: 12.5
    max: 245.3
    median: 45.2
    p95: 189.4
    p99: 234.1
  Codes:
    200: 10   ← Reservas exitosas
    409: 25   ← Sin stock (esperado)
```

## Swagger

```yaml
openapi: 3.0.0
info:
  title: Order Service API
  version: 1.0.0
  
paths:
  /orders:
    post:
      summary: Create new order
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateOrderRequest'
      responses:
        201:
          description: Order created successfully
        409:
          description: Insufficient stock
```