# Full Cycle Docker

Projeto de exemplo com **Node.js**, **MySQL 8** e **Nginx** rodando via Docker Compose.

## Pré-requisitos

- Docker
- Docker Compose

## Como executar

1. Entre na pasta do projeto:

```bash
cd fullcycle-docker
```
2. Suba os containers:

```bash
docker compose up -d
```

3. Acesse a aplicação em:
```bash
http://localhost:8080
```

## Serviços

| Serviço | Descrição | Porta Externa |
| --- | --- | --- |
| nginx | Proxy reverso | 8080 |
| node | Aplicação Node.js | - |
| db | MySQL 8 | - |