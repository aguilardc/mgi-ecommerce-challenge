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

## Ejecutar Tests

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