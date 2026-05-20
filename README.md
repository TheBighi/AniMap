//up
sudo docker compose up -d

//down
sudo docker compose down -v

npx sequelize-cli db:migrate
npx sequelize-cli seed:generate --name seed-regions
