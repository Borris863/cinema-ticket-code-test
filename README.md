# Cinema Tickets

## Requirements

- Node.js 24

## Install

```bash
npm install
```

## Configuration

The default ticket prices and purchase limit can be configured in `.env`.

```bash
cp .env.sample .env
```

## Test

```bash
npm test
```

## Lint

```bash
npm run lint
```

The unit tests cover ticket pricing, seat reservation, purchase limits, adult required rules, and invalid purchase handling.
