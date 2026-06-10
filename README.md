//up
sudo docker compose up -d

//down
sudo docker compose down -v

npx sequelize-cli db:migrate
npx sequelize-cli db:seed

API Documentation (Swagger)

 - Swagger UI: http://localhost:3006/api-docs
