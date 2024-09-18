## Bonzai Hotel - reservationsystem

### Deployment

```
npm install
sls deploy
```

### Usage

Exempelanrop vid POST: {url}/rooms

```json
{
  "capactity": 1
}
```

Exempalanrop vid POST: {url}/reservations

```json
{
  "room_ids": ["{ROOM_ID}", "{ROOM_ID}"],
  "quantity": 3,
  "checkin_date": "2024-09-19",
  "checkout_date": "2024-09-22"
}
```
