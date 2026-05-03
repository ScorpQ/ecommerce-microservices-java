# 🛒 N11 E-Ticaret Projesi

Microservices mimarisi üzerine inşa edilmiş, Spring Boot ve React.js tabanlı fullstack bir e-ticaret uygulaması.

🔗 **Canlı Demo:** [n11-final-case.duckdns.org](http://n11-final-case.duckdns.org)

---

## Mimari

```
                          ┌─────────────────┐
                          │   React.js UI   │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │   API Gateway   │
                          │  (JWT Filter)   │
                          └────────┬────────┘
                                   │
          ┌──────────┬─────────────┼─────────────┬──────────┐
          │          │             │             │          │
   ┌──────▼───┐ ┌────▼────┐ ┌─────▼─────┐ ┌────▼────┐ ┌───▼──────┐
   │ Product  │ │  Cart   │ │   Order   │ │  User   │ │ Payment  │
   │ Service  │ │ Service │ │  Service  │ │ Service │ │ Service  │
   └──────┬───┘ └────┬────┘ └─────┬─────┘ └────┬────┘ └───┬──────┘
          │          │             │             │          │
   ┌──────▼───┐ ┌────▼────┐       │         ┌───▼──────┐   │
   │PostgreSQL│ │  Redis  │       │         │ Keycloak │   │
   │  (RDS)   │ │  Cache  │       │         │          │   │
   └──────────┘ └─────────┘  ┌────▼────┐   └──────────┘   │
                              │  Kafka  │                   │
   ┌──────────┐               │         │            ┌──────▼──────┐
   │   AWS    │               └────┬────┘            │   Iyzico    │
   │OpenSearch│            ┌───────▼──────┐          │  (Sandbox)  │
   └──────────┘            │ Stock Service│          └─────────────┘
                           └──────────────┘

   ┌──────────────────┐    ┌──────────────────┐
   │  Eureka Server   │    │  Config Server   │
   └──────────────────┘    └──────────────────┘
```

---

## Teknoloji Stack'i

### Backend
| Teknoloji         | Versiyon | Kullanım |
|-------------------|----------|----------|
| Spring Boot       | 4.0.6 | Ana framework |
| Netflix Eureka    | - | Service discovery |
| Spring Kafka      | - | Event-driven mimari |
| Spring Data JPA   | - | Veritabanı erişimi |
| Spring Data Redis | - | Sepet cache |
| Keycloak          | - | JWT auth & authorization |
| Amazon OpenSearch | 2.14.0 | Full-text arama |
| AWS SDK S3        | 2.28.0 | Görsel depolama |
| Springdoc OpenAPI | 2.8.8 | API dokümantasyonu |
| PostgreSQL        | - | İlişkisel veritabanı |
| Iyzico            | - | Ödeme entegrasyonu |

### DevOps & Altyapı
| Teknoloji               | Kullanım |
|-------------------------|----------|
| Docker & Docker Compose | Container orchestration |
| AWS EC2                 | Uygulama sunucusu |
| AWS RDS (PostgreSQL)    | Yönetilen veritabanı |
| AWS S3                  | Görsel depolama |
| Amazon OpenSearch Service | Arama motoru |
| DuckDNS                 | Domain yönetimi |

---

## Servisler

| Servis | Açıklama |
|--------|----------|
| API Gateway | Tüm isteklerin giriş noktası, JWT doğrulama |
| Eureka Server | Servis keşfi ve kayıt |
| Config Server | Merkezi konfigürasyon yönetimi |
| Product Service | Ürün CRUD, pagination, OpenSearch entegrasyonu |
| User Service | Kullanıcı kaydı, Keycloak entegrasyonu |
| Stock Service | Stok yönetimi, Kafka consumer |
| Cart Service | Redis tabanlı sepet yönetimi |
| Order Service | Sipariş oluşturma, Saga orchestration |
| Payment Service | Iyzico ödeme entegrasyonu |
| Keycloak | Identity & Access Management |

---

## Özellikler

### Ürün Yönetimi
- Sayfalı ürün listeleme (`GET /api/product/paged?page=0&size=4`)
- Kategoriye göre filtreleme (`?category=electronics`)
- OpenSearch ile full-text arama (`GET /api/product/search?q=apple`)
- Kategori listeleme (`GET /api/product/categories`)
- AWS S3'e görsel yükleme

### Sepet (Redis)
- Sepete ürün ekleme / çıkarma / güncelleme
- Redis'te `cart:{username}` key pattern ile kullanıcıya özel sepet
- JWT token'dan otomatik kullanıcı tanıma

### Sipariş & Ödeme (Saga Pattern)
```
Kullanıcı sipariş oluşturur
        │
        ▼
Order Service → CREATED
        │
        ▼ Kafka: stock-reserve-requested
        │
Stock Service → stok kontrol eder
        │
        ├─ Yeterli stok → Kafka: stock-reserved
        │                       │
        │               Order Service → ödeme başlatır
        │                       │
        │               Payment Service (Iyzico)
        │                       │
        │               ├─ Başarılı → COMPLETED
        │               └─ Başarısız → CANCELLED + stok iade
        │
        └─ Yetersiz stok → Kafka: stock-rejected
                                │
                        Order Service → CANCELLED
```

## API Dokümantasyonu (Swagger)

| Servis | Swagger UI |
|--------|-----------|
| Product Service | `http://n11-final-case.duckdns.org:8085/swagger-ui.html` |
| User Service | `http://n11-final-case.duckdns.org:8086/swagger-ui.html` |
| Stock Service | `http://n11-final-case.duckdns.org:8087/swagger-ui.html` |
| Cart Service | `http://n11-final-case.duckdns.org:8088/swagger-ui.html` |
| Order Service | `http://n11-final-case.duckdns.org:8089/swagger-ui.html` |
| Payment Service | `http://n11-final-case.duckdns.org:8091/swagger-ui.html` |

---

## Kurulum

### Gereksinimler
- Java 21
- Maven 3.9+
- Docker & Docker Compose
- AWS hesabı (RDS, S3, OpenSearch)
- Iyzico sandbox hesabı

### Environment Variables

Her servis için aşağıdaki env variable'lar ayarlanmalıdır:

```env
# Database
DB_HOST=<RDS endpoint>
DB_USERNAME=postgres
DB_PASSWORD=<şifre>

# Eureka
EUREKA_URI=http://eureka:8761/eureka

# Config Server
CONFIG_URI=http://config-server:8762

# Kafka
KAFKA_BOOTSTRAP_SERVERS=kafka:9092

# AWS
AWS_ACCESS_KEY=<access key>
AWS_SECRET_KEY=<secret key>
AWS_S3_BUCKET=<bucket adı>

# OpenSearch
OPENSEARCH_URL=<domain endpoint>
OPENSEARCH_USERNAME=<kullanıcı>
OPENSEARCH_PASSWORD=<şifre>

# Keycloak
KEYCLOAK_TOKEN_URI=http://<keycloak host>:8180/realms/microservice-realm/protocol/openid-connect/token
KEYCLOAK_CLIENT_SECRET=<secret>

# Iyzico
IYZICO_API_KEY=<api key>
IYZICO_SECRET_KEY=<secret key>
```

---

## Proje Yapısı

```
finalBoss/
├── eureka/                 # Service Discovery
├── configServer/           # Config Server
├── gatewayServer/          # API Gateway + JWT Filter
├── productService/         # Ürün servisi + OpenSearch
├── cartService/            # Redis sepet servisi
├── order-service/          # Sipariş + Saga
├── stock-service/          # Stok + Kafka consumer
├── user-service/           # Kullanıcı + Keycloak
├── payment-service/        # Iyzico ödeme
└── docker-compose.yml      # Tüm servisler
```

---

## Nice-to-Have Özellikler

Bu projede zorunlu gereksinimler dışında ek olarak eklenen özellikler:

- **Microservices mimarisi** — Monolitik değil, 7 bağımsız servis
- **Amazon ElasticSearch** — Full-text ürün arama
- **Redis Cache** — Sepet yönetimi
- **AWS S3** — Ürün görseli depolama
- **Spring Cloud Gateway** — Merkezi JWT doğrulama ve routing
- **Keycloak** —  Kimlik yönetimi
- **MCP Server** — AI asistanı ile ürün sorgulama

---