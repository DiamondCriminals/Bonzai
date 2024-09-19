# Bonzai Hotel - reservationsystem

## Deployment

```bash
npm install
sls deploy
```

## Usage

### {url}/rooms

**GET**

<details>
<summary>Response:</summary>

```json
[
  {
    "capacity": 2,
    "price": 1000,
    "room_id": "DUBBEL:f80ad0a3-2405-4270-8bcc-99fcea6c6961",
    "type": "ROOM"
  },
  {
    "capacity": 1,
    "price": 500,
    "room_id": "ENKEL:bd1734c6-3898-4224-8804-4aeba4ff1263",
    "type": "ROOM"
  }
]
```

</details>

**POST**
Request:

```json
{
  "capacity": 1
}
```

<details>
<summary>Response:</summary>

```json
{
  "type": "ROOM",
  "room_id": "ENKEL:6268da18-fbb8-4048-8f57-9f25e527d41d",
  "price": 500,
  "capacity": 1
}
```

</details>

### {url}/reservations

**GET**

<details>
<summary>Response:</summary>

```json
[
  {
    "quantity": 1,
    "checkout_date": "2024-10-07T00:00:00.000Z",
    "total_cost": 1000,
    "checkin_date": "2024-10-06T00:00:00.000Z",
    "type": "RESERVATION",
    "booking_id": "b3121826-dd67-490d-9a13-5291abca0f28",
    "room_ids": ["DUBBEL:757f6d7f-b9fd-4640-a39c-33b07cd7d4e8"]
  }
]
```

</details>

**POST**
Request:

```json
{
  "room_ids": ["{ROOM_ID}", "{ROOM_ID}"],
  "quantity": 3,
  "checkin_date": "2024-09-19",
  "checkout_date": "2024-09-22",
  "name": "Ditt namn"
}
```

<details>
<summary>Response:</summary>

```json
{
  "booking_id": "33c16f19-4608-4a88-9ef7-20e0a2778dab",
  "totalCost": 3000
}
```

</details>

### {url}/reservations/{id}

**GET**

<details>
<summary>Response:</summary>

```json
{
  "quantity": 2,
  "checkout_date": "2024-09-22T00:00:00.000Z",
  "booking_id": "33c16f19-4608-4a88-9ef7-20e0a2778dab",
  "booker": "Ditt namn",
  "total_cost": 3000,
  "checkin_date": "2024-09-19T00:00:00.000Z",
  "type": "RESERVATION",
  "room_ids": ["DUBBEL:585753a3-afbd-4f7c-99c7-c1e671671c88"]
}
```

</details>

**POST**
Request:

```json
{
  "booking_id": "12997206-ae7b-44f2-ad99-91cb57574973",
  "totalCost": 1000
}
```

<details>
<summary>Response:</summary>

```json
{
  "booking_id": "12997206-ae7b-44f2-ad99-91cb57574973",
  "totalCost": 1000
}
```

</details>

**PUT**
Request:
Ändrat datum, rum och mängd personer

```json
{
  "room_ids": ["DUBBEL:585753a3-afbd-4f7c-99c7-c1e671671c88"],
  "quantity": 1,
  "checkin_date": "2024-09-19",
  "checkout_date": "2024-09-25",
  "name": "Ditt namn"
}
```

<details>
<summary>Response:</summary>

```json
{
  "booking_id": "12997206-ae7b-44f2-ad99-91cb57574973",
  "totalCost": 1000,
  "message": "Successfully updated reservation."
}
```

</details>
