## Demo nalozi

Svi korisnici iz `users.json` koriste isti demo password:

```text
Demopass1!
```

## Import redosled

Pokreni ove komande iz root foldera projekta:

```powershell
mongoimport --db sportsphere_hub --collection sports --file database\collections\sports.json --jsonArray --drop
mongoimport --db sportsphere_hub --collection organizations --file database\collections\organizations.json --jsonArray --drop
mongoimport --db sportsphere_hub --collection users --file database\collections\users.json --jsonArray --drop
mongoimport --db sportsphere_hub --collection facilities --file database\collections\facilities.json --jsonArray --drop
mongoimport --db sportsphere_hub --collection resources --file database\collections\resources.json --jsonArray --drop
mongoimport --db sportsphere_hub --collection reservations --file database\collections\reservations.json --jsonArray --drop
mongoimport --db sportsphere_hub --collection promotions --file database\collections\promotions.json --jsonArray --drop
mongoimport --db sportsphere_hub --collection trainers --file database\collections\trainers.json --jsonArray --drop
mongoimport --db sportsphere_hub --collection trainingSessions --file database\collections\trainingSessions.json --jsonArray --drop
mongoimport --db sportsphere_hub --collection equipment --file database\collections\equipment.json --jsonArray --drop
mongoimport --db sportsphere_hub --collection orders --file database\collections\orders.json --jsonArray --drop
mongoimport --db sportsphere_hub --collection teammateAds --file database\collections\teammateAds.json --jsonArray --drop
mongoimport --db sportsphere_hub --collection reactions --file database\collections\reactions.json --jsonArray --drop
mongoimport --db sportsphere_hub --collection passwordResetTokens --file database\collections\passwordResetTokens.json --jsonArray --drop
mongosh sportsphere_hub database\indexes.js
```

